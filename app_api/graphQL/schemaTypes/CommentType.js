const graphql = require("graphql")
const LikeType = require("./LikeType");

const {
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLID,
    GraphQLInt,
    GraphQLList } = graphql;

const CommentType = new GraphQLObjectType({
    name:"Comment",
    fields:() => ({
        id: {type: GraphQLID},
        author: {type: GraphQLString},
        commentText: {type: GraphQLString},
        likes: {type: new GraphQLList(LikeType)},
        like_count: {type: GraphQLInt, "default": 0},   // increments on liking a comment
        createdOn: {type: GraphQLString, "default": Date.now}
    })
});

module.exports = CommentType;
