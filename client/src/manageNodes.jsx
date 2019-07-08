import React, { Component } from "react";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import values from "lodash/values";
import TreeNode from "./treeNode";
import { FaToggleOn, FaToggleOff, FaTimes } from "react-icons/fa";
import styled from "styled-components";

const GetNodesAsObj = gql`
  mutation getNodesAsObj($retailer: String!) {
    getNodesAsObj(retailer: $retailer) {
      nodes
    }
  }
`;
const LinkNodes = gql`
  mutation linkNodes($nodeId: String!, $nodeList: [linkedNodeInput]!) {
    linkNodes(nodeId: $nodeId, nodeList: $nodeList) {
      flipkartNodes {
        nodeId
        nodeName
        pathString
        pathNameString
        pathLength
        linkedNodes {
          retailer
          nodeId
          nodePath
        }
      }
      amazonNodes {
        nodeId
        nodeName
        pathString
        pathNameString
        pathLength
        linkedNodes {
          retailer
          nodeId
          nodePath
        }
      }
      huddlieNodes {
        nodeId
        nodeName
        pathString
        pathNameString
        pathLength
        linkedNodes {
          retailer
          nodeId
          nodePath
        }
      }
    }
  }
`;
const RemoveLink = gql`
  mutation removeLink($nodeId: String!, $nodeToDelete: linkedNodeInput!) {
    removeLink(nodeId: $nodeId, nodeToDelete: $nodeToDelete) {
      flipkartNodes {
        nodeId
        nodeName
        pathString
        pathNameString
        pathLength
        linkedNodes {
          retailer
          nodeId
          nodePath
        }
      }
      amazonNodes {
        nodeId
        nodeName
        pathString
        pathNameString
        pathLength
        linkedNodes {
          retailer
          nodeId
          nodePath
        }
      }
      huddlieNodes {
        nodeId
        nodeName
        pathString
        pathNameString
        pathLength
        linkedNodes {
          retailer
          nodeId
          nodePath
        }
      }
    }
  }
`;

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

const AddedNodeOuter = styled.div`
  display: flex;
  flex-direction: column;
  padding 5px 75px;
`;

const AddedNodeInner = styled.div`
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

class ManageNodes extends Component {
  state = {
    showFlipkartNodes: true,
    showAmazonNodes: false,
    toggleOnHover: false,
    fkNodes: {},
    amNodes: {},
    hdNodes: {},
    fkSelected: "",
    amSelected: "",
    hdSelected: "",
    linkNodesNode: { nodeId: "", nodePath: "" },
    linkNodesNodeList: []
  };

  getRootNodes = retailer => {
    var nodes = {};
    switch (retailer) {
      case "hd":
        nodes = this.state.hdNodes;
        break;
      case "fk":
        nodes = this.state.fkNodes;
        break;
      case "am":
        nodes = this.state.amNodes;
        break;
      default:
        break;
    }

    return values(nodes).filter(node => node.pathLength === 0);
  };

  getChildNodes = (retailer, node) => {
    var nodes = {};
    switch (retailer) {
      case "hd":
        nodes = this.state.hdNodes;
        break;
      case "fk":
        nodes = this.state.fkNodes;
        break;
      case "am":
        nodes = this.state.amNodes;
        break;
      default:
        break;
    }
    var result = values(nodes).filter(
      node2 => node2.pathNameString === node.tempPath
    );
    // console.log(result);
    return result;
  };

  onHover = (retailer, node) => {
    if (this.state.toggleOnHover && !node.isOpen) {
      this.onToggle(retailer, node);
    }
  };

  onToggle = (retailer, node) => {
    const tempName = retailer + "Nodes";
    var nodes = {};
    switch (retailer) {
      case "hd":
        nodes = this.state.hdNodes;
        break;
      case "fk":
        nodes = this.state.fkNodes;
        break;
      case "am":
        nodes = this.state.amNodes;
        break;
      default:
        break;
    }

    nodes[node.tempPath].isOpen = !node.isOpen;
    this.setState({ [tempName]: nodes });
  };

  onSelectNode = (retailer, node) => {
    const tempNodesName = retailer + "Nodes";
    const tempSelectedName = retailer + "Selected";

    var nodes = {};
    var currentlySelected = "";
    switch (retailer) {
      case "hd":
        nodes = this.state.hdNodes;
        currentlySelected = this.state.hdSelected;
        break;
      case "fk":
        nodes = this.state.fkNodes;
        currentlySelected = this.state.fkSelected;
        break;
      case "am":
        nodes = this.state.amNodes;
        currentlySelected = this.state.amSelected;
        break;
      default:
        break;
    }

    if (currentlySelected !== "" && currentlySelected !== node.tempPath) {
      nodes[currentlySelected].isSelected = node.isSelected;
    }

    nodes[node.tempPath].isSelected = !node.isSelected;
    this.setState({
      [tempNodesName]: nodes,
      [tempSelectedName]: node.tempPath
    });
  };

  onAddNode = (retailer, node) => {
    var tempNodePath = "";

    if (retailer === "hd") {
      if (node.pathLength > 0) {
        tempNodePath = node.pathNameString + ">" + node.nodeName;
      } else {
        tempNodePath = node.nodeName;
      }

      if (this.state.linkNodesNode.nodeId === "") {
        this.setState({
          linkNodesNode: { nodeId: node.nodeId, nodePath: tempNodePath }
        });
      } else if (this.state.linkNodesNode.nodeId !== node.nodeId) {
        this.setState({
          linkNodesNode: { nodeId: node.nodeId, nodePath: tempNodePath },
          linkNodesNodeList: []
        });
      }
    } else {
      var list = this.state.linkNodesNodeList;
      tempNodePath = "";

      if (node.pathLength > 0) {
        tempNodePath = node.pathNameString + ">" + node.nodeName;
      } else {
        tempNodePath = node.nodeName;
      }

      var toBeAdded = true;
      for (var x = 0; x < list.length; x++) {
        var tempNode = list[x];
        if (
          tempNode.retailer === retailer &&
          tempNode.nodeId === node.nodeId &&
          tempNode.nodePath === tempNodePath
        ) {
          toBeAdded = false;
        }
      }

      if (toBeAdded) {
        list.push({
          retailer: retailer,
          nodeId: node.nodeId,
          nodePath: tempNodePath
        });
      }

      this.setState({
        linkNodesNodeList: list
      });
    }
  };

  showRemoveButton = elId => {
    console.log(elId);
    var el = document.getElementById(elId);
    if (el.style.display === "" || el.style.display === "none") {
      var x = document.getElementsByClassName("linkedNodeRemoveBtn");
      var i;
      for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
      }
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  };

  switchRetailerView = () => {
    this.setState(
      {
        showFlipkartNodes: !this.state.showFlipkartNodes,
        showAmazonNodes: !this.state.showAmazonNodes
      },
      function() {
        if (this.state.showFlipkartNodes) {
          document.getElementById("flipkart-outer-div").style.display = "block";
        } else {
          document.getElementById("flipkart-outer-div").style.display = "none";
        }
        if (this.state.showAmazonNodes) {
          document.getElementById("amazon-outer-div").style.display = "block";
        } else {
          document.getElementById("amazon-outer-div").style.display = "none";
        }
      }
    );
  };

  removeLink = async (node, linkedNode) => {
    console.log(node);
    console.log(linkedNode);
    var result = await this.props.RemoveLink({
      variables: {
        nodeId: node.nodeId,
        nodeToDelete: {
          nodeId: linkedNode.nodeId,
          retailer: linkedNode.retailer,
          nodePath: linkedNode.nodePath
        }
      }
    });
    console.log(result);

    if (result && result.data && result.data.removeLink) {
      var tempKey = "";
      var node = {};
      var nodes = {};
      if (
        result.data.removeLink.amazonNodes &&
        result.data.removeLink.amazonNodes.length > 0
      ) {
        node = result.data.removeLink.amazonNodes[0];
        if (node.pathLength > 0) {
          tempKey = node.pathNameString + ">" + node.nodeName;
        } else {
          tempKey = node.nodeName;
        }
        nodes = this.state.amNodes;
        nodes[tempKey].linkedNodes = node.linkedNodes;
        await this.setState({ amNodes: nodes });
      }
      if (
        result.data.removeLink.flipkartNodes &&
        result.data.removeLink.flipkartNodes.length > 0
      ) {
        node = result.data.removeLink.flipkartNodes[0];
        if (node.pathLength > 0) {
          tempKey = node.pathNameString + ">" + node.nodeName;
        } else {
          tempKey = node.nodeName;
        }
        nodes = this.state.fkNodes;
        nodes[tempKey].linkedNodes = node.linkedNodes;
        await this.setState({ fkNodes: nodes });
      }
      if (
        result.data.removeLink.huddlieNodes &&
        result.data.removeLink.huddlieNodes.length > 0
      ) {
        node = result.data.removeLink.huddlieNodes[0];
        if (node.pathLength > 0) {
          tempKey = node.pathNameString + ">" + node.nodeName;
        } else {
          tempKey = node.nodeName;
        }
        nodes = this.state.hdNodes;
        nodes[tempKey].linkedNodes = node.linkedNodes;
        await this.setState({ hdNodes: nodes });
      }
    }
  };

  linkNodes = async () => {
    var nodeId = this.state.linkNodesNode.nodeId;
    var nodeList = this.state.linkNodesNodeList;

    var result = await this.props.LinkNodes({
      variables: {
        nodeId: nodeId,
        nodeList: nodeList
      }
    });

    console.log(result);
    var fkNodes = [];
    var amNodes = [];
    if (result && result.data && result.data.linkNodes) {
      var tempKey = "";
      var node = {};
      var nodes = {};
      if (result.data.linkNodes.amazonNodes) {
        amNodes = result.data.linkNodes.amazonNodes;
        nodes = this.state.amNodes;
        for (var x = 0; x < amNodes.length; x++) {
          node = amNodes[x];
          if (node.pathLength > 0) {
            tempKey = node.pathNameString + ">" + node.nodeName;
          } else {
            tempKey = node.nodeName;
          }

          nodes[tempKey].linkedNodes = node.linkedNodes;
          await this.setState({ amNodes: nodes });
        }
      }

      if (result.data.linkNodes.flipkartNodes) {
        fkNodes = result.data.linkNodes.flipkartNodes;
        nodes = this.state.fkNodes;
        for (var y = 0; y < fkNodes.length; y++) {
          node = fkNodes[y];
          if (node.pathLength > 0) {
            tempKey = node.pathNameString + ">" + node.nodeName;
          } else {
            tempKey = node.nodeName;
          }

          nodes[tempKey].linkedNodes = node.linkedNodes;
          await this.setState({ fkNodes: nodes });
        }
      }

      if (result.data.linkNodes.huddlieNodes) {
        node = result.data.linkNodes.huddlieNodes[0];
        if (node.pathLength > 0) {
          tempKey = node.pathNameString + ">" + node.nodeName;
        } else {
          tempKey = node.nodeName;
        }

        nodes = this.state.hdNodes;

        nodes[tempKey].linkedNodes = node.linkedNodes;
        await this.setState({ hdNodes: nodes });

        this.setState({
          linkNodesNode: { nodeId: "", nodePath: "" },
          linkNodesNodeList: []
        });
      }
    }
  };

  setupNodesAsObj = async retailer => {
    var nodesObj = await this.props.GetNodesAsObj({
      variables: {
        retailer: retailer
      }
    });
    var nodes = {};
    // console.log(nodesObj);
    if (
      nodesObj &&
      nodesObj.data &&
      nodesObj.data.getNodesAsObj &&
      nodesObj.data.getNodesAsObj.nodes &&
      nodesObj.data.getNodesAsObj.nodes !== ""
    ) {
      nodes = JSON.parse(nodesObj.data.getNodesAsObj.nodes);
    }
    var tempName = "";
    if (retailer === "hd") {
      tempName = "hdNodes";
    }
    if (retailer === "am") {
      tempName = "amNodes";
    }
    if (retailer === "fk") {
      tempName = "fkNodes";
    }

    this.setState({ [tempName]: nodes }, function() {
      console.log(this.state);
    });
  };

  refreshTrees = async () => {
    await this.setupNodesAsObj("hd");
    await this.setupNodesAsObj("fk");
    await this.setupNodesAsObj("am");
  };

  handleToggleOnHover = () => {
    var temp = this.state.toggleOnHover;
    this.setState({
      toggleOnHover: !temp
    });
  };

  removeAddedNode = (retailer, node) => {
    if (retailer === "hd") {
      this.setState({ linkNodesNode: { nodeId: "", nodePath: "" } });
    } else {
      var nodes = this.state.linkNodesNodeList;
      var newNodes = nodes.filter(function(value, index, arr) {
        return (
          value.retailer !== retailer ||
          value.nodeId !== node.nodeId ||
          value.nodePath !== node.nodePath
        );
      });

      this.setState({ linkNodesNodeList: newNodes });
    }
  };

  render() {
    const hdRootNodes = this.getRootNodes("hd");
    const fkRootNodes = this.getRootNodes("fk");
    const amRootNodes = this.getRootNodes("am");

    return (
      <div className="custom-outer-div">
        <div className="custom-box-container">
          <div className="inner-container">
            <div className="custom-row">
              <div className="custom-row-left-30" />
              <div className="custom-row-center-40">
                <button className="custom-btn" onClick={this.refreshTrees}>
                  Refresh
                </button>
              </div>
              <div className="custom-row-right-30">
                <div className="custom-toggle-div">
                  <label className="custom-toggle-label">Toggle On Hover</label>
                  {this.state.toggleOnHover ? (
                    <FaToggleOn
                      className="custom-toggle"
                      onClick={this.handleToggleOnHover}
                    />
                  ) : (
                    <FaToggleOff
                      className="custom-toggle"
                      onClick={this.handleToggleOnHover}
                    />
                  )}
                </div>
              </div>
            </div>

            {(this.state.linkNodesNode.nodeId !== "" ||
              this.state.linkNodesNodeList.length > 0) && (
              <div className="custom-row" style={{ background: "#eee" }}>
                <div className="custom-row-left-43">
                  <AddedNodeOuter>
                    {this.state.linkNodesNodeList.map(node => (
                      <AddedNodeInner
                        retailer={node.retailer}
                        className="added-node-inner-div"
                        key={node.nodeId}
                      >
                        <label>{node.nodePath}</label>
                        <FaTimes
                          onClick={() =>
                            this.removeAddedNode(node.retailer, node)
                          }
                        />
                      </AddedNodeInner>
                    ))}
                  </AddedNodeOuter>
                </div>
                <div className="custom-row-center-14 custom-align-center">
                  <button
                    className="custom-btn custom-btn2"
                    onClick={this.linkNodes}
                  >
                    Link Categories
                  </button>
                </div>
                <div className="custom-row-right-43 custom-align-center">
                  {this.state.linkNodesNode.nodeId !== "" && (
                    <AddedNodeOuter>
                      <AddedNodeInner
                        retailer={"hd"}
                        className="added-node-inner-div"
                      >
                        <label>{this.state.linkNodesNode.nodePath}</label>
                        <FaTimes
                          onClick={() =>
                            this.removeAddedNode("hd", this.state.linkNodesNode)
                          }
                        />
                      </AddedNodeInner>
                    </AddedNodeOuter>
                  )}
                </div>
              </div>
            )}

            <div className="mc-row">
              <div id="retailer-outer-div" className="mc-row-50">
                <div className="custom-box-controller">
                  <div
                    className={
                      this.state.showFlipkartNodes
                        ? "controller selected-controller"
                        : "controller"
                    }
                    onClick={this.switchRetailerView}
                  >
                    Flipkart
                  </div>
                  <div
                    className={
                      this.state.showAmazonNodes
                        ? "controller selected-controller"
                        : "controller"
                    }
                    onClick={this.switchRetailerView}
                  >
                    Amazon
                  </div>
                </div>
                <div id="flipkart-outer-div">
                  {fkRootNodes.map(node => (
                    <TreeNode
                      node={node}
                      getChildNodes={this.getChildNodes}
                      onToggle={this.onToggle}
                      retailer="fk"
                      key={node.nodeId}
                      onHover={this.onHover}
                      onSelectNode={this.onSelectNode}
                      onAddNode={this.onAddNode}
                      removeLink={this.removeLink}
                      showRemoveButton={this.showRemoveButton}
                    />
                  ))}
                </div>
                <div id="amazon-outer-div">
                  {amRootNodes.map(node => (
                    <TreeNode
                      node={node}
                      getChildNodes={this.getChildNodes}
                      onToggle={this.onToggle}
                      retailer="am"
                      key={node.nodeId}
                      onHover={this.onHover}
                      onSelectNode={this.onSelectNode}
                      onAddNode={this.onAddNode}
                      removeLink={this.removeLink}
                      showRemoveButton={this.showRemoveButton}
                    />
                  ))}
                </div>
              </div>
              <div id="huddlie-outer-div" className="mc-row-50">
                <div className="header">Huddlie</div>
                {hdRootNodes.map(node => (
                  <TreeNode
                    node={node}
                    getChildNodes={this.getChildNodes}
                    onToggle={this.onToggle}
                    retailer="hd"
                    key={node.nodeId}
                    onHover={this.onHover}
                    onSelectNode={this.onSelectNode}
                    onAddNode={this.onAddNode}
                    removeLink={this.removeLink}
                    showRemoveButton={this.showRemoveButton}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(GetNodesAsObj, { name: "GetNodesAsObj" }),
  graphql(LinkNodes, { name: "LinkNodes" }),
  graphql(RemoveLink, { name: "RemoveLink" })
)(ManageNodes);
