const graphql = require('graphql');
const LikeType = require('./LikeType');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList} = graphql;

const ReviewType = new GraphQLObjectType({
  name: 'Review',
  fields: () => ({
    id: {type: GraphQLID},
    author: {type: GraphQLString},
    rating: {'type': GraphQLInt, 'default': 0, 'min': 0, 'max': 5},
    reviewText: {type: GraphQLString},
    likes: {type: new GraphQLList(LikeType)},
    like_count: {'type': GraphQLInt, 'default': 0}, // increments on liking a review
    createdOn: {'type': GraphQLString, 'default': Date.now},
  }),
});

module.exports = ReviewType;
