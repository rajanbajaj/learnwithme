const graphql = require("graphql")
const mongoose = require("mongoose")
const Post = mongoose.model('Post')
const Member = mongoose.model('Member')
const MemberSchema = require("./schemaTypes/MemberType");
const PostSchema = require("./schemaTypes/PostType");

const { 
    GraphQLSchema,
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLID,
    GraphQLInt,
    GraphQLList } = graphql;

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields:{
        ...MemberSchema.queries, 
        ...PostSchema.queries,
    }
});

const Mutation = new GraphQLObjectType({
    name:"Mutation",
    fields:{
        ...MemberSchema.mutations
    }
});

module.exports = new GraphQLSchema({
    query:RootQuery,
    mutation: Mutation
});