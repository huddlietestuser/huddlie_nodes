const { GraphQLServer } = require("graphql-yoga");
const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/HuddlieNodes"
);

const FkNode = mongoose.model(
  "flipkartNodes",
  {
    nodeId: String,
    pathNameString: String,
    nodeName: String,
    pathString: String,
    pathLength: Number,
    linkedNodes: []
  },
  "flipkartNodes"
);
const AmNode = mongoose.model(
  "amazonNodes",
  {
    nodeId: String,
    pathNameString: String,
    nodeName: String,
    pathString: String,
    pathLength: Number,
    linkedNodes: []
  },
  "amazonNodes"
);
const HdNode = mongoose.model(
  "huddlieNodes",
  {
    nodeId: String,
    pathNameString: String,
    nodeName: String,
    pathString: String,
    pathLength: Number,
    linkedNodes: []
  },
  "huddlieNodes"
);

const typeDefs = `
  type Query {
    hello(name: String): String!
    getFkNodes: [flipkartNode]
    getAmNodes: [amazonNode]
    getHdNodes: [huddlieNode]
  }

  type Mutation {
    getNodesAsObj(retailer:String!): nodesObj
    linkNodes(nodeId:String!, nodeList: [linkedNodeInput]!): returnNodes
    removeLink(nodeId:String!, nodeToDelete: linkedNodeInput!): returnNodes
  }

  input linkedNodeInput {
    retailer: String!,
    nodeId: String!,
    nodePath: String! 
  }
  type linkedNode {
    retailer: String!,
    nodeId: String!,
    nodePath: String! 
  }

  type flipkartNode {
      nodeId: String!,
      pathNameString: String!,
      nodeName: String!,
      pathString: String!,
      pathLength: Int!,
      linkedNodes: [linkedNode]
  }
  type amazonNode {
    nodeId: String!,
    pathNameString: String!,
    nodeName: String!,
    pathString: String!,
    pathLength: Int!,
    linkedNodes: [linkedNode]
}
type huddlieNode {
  nodeId: String!,
  pathNameString: String!,
  nodeName: String!,
  pathString: String!,
  pathLength: Int!,
  linkedNodes: [linkedNode]
}

type returnNodes {
  flipkartNodes: [flipkartNode],
  amazonNodes: [amazonNode],
  huddlieNodes: [huddlieNode]
}

type nodesObj {
  nodes: String
}
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || "World"}`,
    getFkNodes: () => FkNode.find().sort({ pathLength: 1 }),
    getAmNodes: () => AmNode.find().sort({ pathLength: 1 }),
    getHdNodes: () => HdNode.find().sort({ pathLength: 1 })
  },
  Mutation: {
    getNodesAsObj: async (_, { retailer }) => {
      var nodeArray = [];
      switch (retailer) {
        case "fk":
          nodeArray = await FkNode.find().sort({ pathLength: 1 });
          break;
        case "am":
          nodeArray = await AmNode.find().sort({ pathLength: 1 });
          break;
        case "hd":
          nodeArray = await HdNode.find().sort({ pathLength: 1 });
          break;
        default:
          break;
      }
      var temp = {};
      for (var x = 0; x < nodeArray.length; x++) {
        var node = nodeArray[x];
        var tempKey = "";
        if (node.pathLength > 0) {
          tempKey = node.pathNameString + ">" + node.nodeName;
        } else {
          tempKey = node.nodeName;
        }

        temp[tempKey] = {
          nodeId: node.nodeId,
          nodeName: node.nodeName,
          pathNameString: node.pathNameString,
          pathString: node.pathString,
          pathLength: node.pathLength,
          linkedNodes: node.linkedNodes,
          tempPath: tempKey
        };
      }
      return { nodes: JSON.stringify(temp) };
    },
    removeLink: async (_, { nodeId, nodeToDelete }) => {
      var fkresult = [];
      var amresult = [];
      var hdresult = [];
      var node = await HdNode.findOne({ nodeId: nodeId });
      var nodeList = node.linkedNodes;
      var newNodeList = nodeList.filter(function(value, index, arr) {
        return (
          value.retailer !== nodeToDelete.retailer ||
          value.nodeId !== nodeToDelete.nodeId ||
          value.nodePath !== nodeToDelete.nodePath
        );
      });

      node.linkedNodes = newNodeList;
      await node.save();
      hdresult = [node];

      var node2 = {};
      var nodeList2 = [];
      var newNodeList2 = [];

      if (nodeToDelete.retailer == "fk") {
        node2 = await FkNode.findOne({ nodeId: nodeToDelete.nodeId });
        nodeList2 = node2.linkedNodes;
        newNodeList2 = nodeList2.filter(function(value, index, arr) {
          return value.retailer !== "hd" || value.nodeId !== nodeId;
        });

        node2.linkedNodes = newNodeList2;
        await node2.save();
        fkresult = [node2];
      }

      if (nodeToDelete.retailer == "am") {
        node2 = await AmNode.findOne({ nodeId: nodeToDelete.nodeId });
        nodeList2 = node2.linkedNodes;
        newNodeList2 = nodeList2.filter(function(value, index, arr) {
          return value.retailer !== "hd" || value.nodeId !== nodeId;
        });

        node2.linkedNodes = newNodeList2;
        await node2.save();
        amresult = [node2];
      }

      return {
        flipkartNodes: fkresult,
        amazonNodes: amresult,
        huddlieNodes: hdresult
      };
    },
    linkNodes: async (_, { nodeId, nodeList }) => {
      var node = await HdNode.findOne({ nodeId: nodeId });

      var tempNodePath = "";

      if (node.pathLength > 0) {
        tempNodePath = node.pathNameString + ">" + node.nodeName;
      } else {
        tempNodePath = node.nodeName;
      }

      var nodeToAdd = {
        retailer: "hd",
        nodeId: node.nodeId,
        nodePath: tempNodePath
      };

      var fkList = [];
      var amList = [];

      for (var x = 0; x < nodeList.length; x++) {
        var curNode = nodeList[x];
        var existingNodes = node.linkedNodes;
        var shouldAdd = true;
        for (var y = 0; y < existingNodes.length; y++) {
          if (
            curNode.retailer === existingNodes[y].retailer &&
            curNode.nodeId === existingNodes[y].nodeId
          ) {
            shouldAdd = false;
          }
        }

        if (shouldAdd) {
          node.linkedNodes.push(curNode);
        }

        if (curNode.retailer === "fk") {
          fkList.push(curNode.nodeId);
        }

        if (curNode.retailer === "am") {
          amList.push(curNode.nodeId);
        }
      }

      await node.save();

      var flipkartNodes = [];
      var amazonNodes = [];

      if (fkList.length > 0) {
        for (var a = 0; a < fkList.length; a++) {
          var node2 = await FkNode.findOne({ nodeId: fkList[a] });

          if (node2) {
            var existingNodes2 = node2.linkedNodes;
            var shouldAdd = true;
            for (var y = 0; y < existingNodes2.length; y++) {
              if (
                nodeToAdd.retailer === existingNodes2[y].retailer &&
                nodeToAdd.nodeId === existingNodes2[y].nodeId
              ) {
                shouldAdd = false;
              }
            }

            if (shouldAdd) {
              node2.linkedNodes.push(nodeToAdd);
            }

            await node2.save();

            flipkartNodes.push(node2);
          }
        }
      }

      if (amList.length > 0) {
        for (var a = 0; a < amList.length; a++) {
          var node2 = await AmNode.findOne({ nodeId: amList[a] });
          if (node2) {
            var existingNodes2 = node2.linkedNodes;
            var shouldAdd = true;
            for (var y = 0; y < existingNodes2.length; y++) {
              if (
                nodeToAdd.retailer === existingNodes2[y].retailer &&
                nodeToAdd.nodeId === existingNodes2[y].nodeId
              ) {
                shouldAdd = false;
              }
            }

            if (shouldAdd) {
              node2.linkedNodes.push(nodeToAdd);
            }

            await node2.save();

            amazonNodes.push(node2);
          }
        }
      }

      return {
        flipkartNodes: flipkartNodes,
        amazonNodes: amazonNodes,
        huddlieNodes: [node]
      };
    }
  }
};
const options = { port: process.env.PORT || 4000, endpoint: "/graphql" };

const server = new GraphQLServer({ typeDefs, resolvers });
const app = server.express;

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

mongoose.connection.once("open", function() {
  server.start(options, () =>
    console.log("Server is running on localhost:4000")
  );
});
