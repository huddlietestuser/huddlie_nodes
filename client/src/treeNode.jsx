import React from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaTimes,
  FaLayerGroup,
  FaPlusSquare,
  FaRegDotCircle,
  FaCircle
} from "react-icons/fa";
import styled from "styled-components";
import PropTypes from "prop-types";
import { link } from "fs";

const getPaddingLeft = level => {
  let paddingLeft = level * 20;
  return paddingLeft;
};

const getBackgroundColor = retailer => {
  var color = "#e0ffff"; //light cyan
  if (retailer === "header") {
    color = "#eee";
  } else if (retailer === "hd") {
    color = "#e0ffff";
  } else if (retailer === "fk") {
    color = "#F8E831";
  } else if (retailer === "am") {
    color = "#146EB4";
  }
  return color;
};
const getColor = retailer => {
  var color = "#000"; //light cyan
  if (retailer === "fk") {
    color = "#047BD5";
  } else if (retailer === "am") {
    color = "#FF9900";
  }
  return color;
};

const StyledTreeNode = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 8px;
  &:hover {
    background: lightgray;
  }
  background: ${props => (props.isSelected ? "#ddd" : "none")};
`;

const StyledTreeNodeLeft = styled.div`
  padding-left: ${props => getPaddingLeft(props.level)}px;
  width: 80%;
  display: flex;
  flex-direction: row;
`;
const StyledTreeNodeRight = styled.div`
  width: 20%;
  display: flex;
  flex-direction: row;
`;

const NodeIcon = styled.div`
  cursor: pointer;
  padding: 0px 0px 0px 15px;
  font-size: 15px;
  margin-right: ${props => (props.marginRight ? props.marginRight : 5)}px;
`;
const NodeIcon2 = styled.div`
  cursor: pointer;
  margin-left: 15px;
  font-size: 15px;
  padding: 0px 5px 2px 5px;
  border: 1px solid #eee;
  border-radius: 5px;
  &:hover {
    border: 1px solid #ddd;
    background: white;
  }
`;

const NodeIconRed = styled.div`
  margin-left: 10px;
  color: red;
`;
const NodeIconGreen = styled.div`
  margin-left: 10px;
  color: green;
`;

const SelectedNodeOuter = styled.div`
  background: ${props => (props.isSelected ? "#eee" : "none")};
  display: flex;
  flex-direction: column;
  padding 5px 75px;
`;

const SelectedNodeInner = styled.div`
  background: ${props => getBackgroundColor(props.retailer)};
  color: ${props => getColor(props.retailer)};
  font-family: Ozxgen, sans-serif;
  margin: 0px 0px 5px 0px !important;
  box-shadow: ${props =>
    props.retailer === "header"
      ? "0px"
      : "0px 0px 5px 0px rgba(15, 15, 15, 0.2)"};
  border-radius: ${props => (props.retailer === "header" ? "0px" : "10px")};
  vertical-align: middle;
  display: flex;
  flex-direction: row;
`;

const TreeNode = props => {
  const {
    node,
    getChildNodes,
    level,
    onToggle,
    retailer,
    onHover,
    onSelectNode,
    onAddNode,
    removeLink,
    showRemoveButton
  } = props;

  return (
    <React.Fragment>
      <StyledTreeNode level={level} isSelected={node.isSelected}>
        <StyledTreeNodeLeft level={level}>
          <NodeIcon
            onClick={() => onToggle(retailer, node)}
            onMouseOver={() => onHover(retailer, node)}
          >
            {getChildNodes(retailer, node).length > 0 &&
              (node.isOpen ? <FaChevronDown /> : <FaChevronRight />)}
          </NodeIcon>

          {/* <span role="button" onClick={() => onNodeSelect(node)}> */}
          <span
            className="tree-node-name-span"
            role="button"
            onClick={() => onToggle(retailer, node)}
            onMouseOver={() => onHover(retailer, node)}
          >
            {node.nodeName}
          </span>
        </StyledTreeNodeLeft>
        {/* <button className="tree-edit-btn">Select</button> */}
        <StyledTreeNodeRight>
          <NodeIcon2 onClick={() => onSelectNode(retailer, node)}>
            <FaLayerGroup />
          </NodeIcon2>
          <NodeIcon2 onClick={() => onAddNode(retailer, node)}>
            <FaPlusSquare />
          </NodeIcon2>
          {node.linkedNodes.length > 0 ? (
            <NodeIconGreen>
              <FaCircle />
            </NodeIconGreen>
          ) : (
            <NodeIconRed>
              <FaRegDotCircle />
            </NodeIconRed>
          )}
        </StyledTreeNodeRight>
      </StyledTreeNode>
      {node.isSelected && (
        <SelectedNodeOuter isSelected={node.isSelected}>
          <label>
            <b>Currently Linked Nodes</b>
          </label>
          {node.linkedNodes.map(linkedNode => (
            <React.Fragment key={linkedNode.nodeId}>
              <SelectedNodeInner
                retailer={linkedNode.retailer}
                className={
                  retailer === "hd"
                    ? "selected-node-inner-div-x"
                    : "selected-node-inner-div"
                }
              >
                <label>{linkedNode.nodePath}</label>
                {retailer === "hd" && (
                  <FaTimes
                    onClick={() =>
                      showRemoveButton(linkedNode.nodeId + "removebtn")
                    }
                  />
                )}
              </SelectedNodeInner>
              <button
                id={linkedNode.nodeId + "removebtn"}
                className="custom-btn linkedNodeRemoveBtn"
                onClick={() => removeLink(node, linkedNode)}
              >
                Remove Link
              </button>
            </React.Fragment>
          ))}
        </SelectedNodeOuter>
      )}
      {node.isOpen &&
        getChildNodes(retailer, node).map(childNode => (
          <TreeNode
            {...props}
            node={childNode}
            level={level + 1}
            key={childNode.nodeId}
          />
        ))}
    </React.Fragment>
  );
};

TreeNode.propTypes = {
  node: PropTypes.object.isRequired,
  getChildNodes: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
  onToggle: PropTypes.func.isRequired
};

TreeNode.defaultProps = {
  level: 0
};

export default TreeNode;
