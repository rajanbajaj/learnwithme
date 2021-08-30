const graphql = require("graphql")

const {
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLID } = graphql;

const LikeType = new GraphQLObjectType({
    name:"Like",
    fields:() => ({
        id: {type: GraphQLID},
        author: {type: GraphQLString},
        createdOn: {type: GraphQLString, "default": Date.now}
    })
});

module.exports = LikeType;