const graphql = require('graphql');
const LikeType = require('./LikeType');
const CommentType = require('./CommentType');
const ReviewType = require('./ReviewType');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');


const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList} = graphql;

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: {type: GraphQLID},
    title: {type: GraphQLString, required: true},
    publish_status: {type: GraphQLString, default: 'DRAFT'},
    author: {type: GraphQLString},
    body: {type: GraphQLString},
    summary: {type: GraphQLString},
    rating: {'type': GraphQLInt, 'default': 0, 'min': 0, 'max': 5}, // avg of all review ratings
    tags: {type: new GraphQLList(GraphQLString)},
    comments: {type: new GraphQLList(CommentType)},
    reviews: {type: new GraphQLList(ReviewType)},
    likes: {type: new GraphQLList(LikeType)}, // array of member_ids :: column used for analytics and not frontend
    like_count: {'type': GraphQLInt, 'default': 0}, // increments on liking a post
    createdOn: {'type': GraphQLString, 'default': Date.now},
  }),
});

const PostQueries = {
  post: {
    type: PostType,
    args: {
      id: {
        type: GraphQLID,
      },
    },
    resolve(parent, args) {
      const data = Post.findById(args.id);
      return data;
    },
  },
  posts: {
    type: new GraphQLList(PostType),
    args: {
      limit: {
        type: GraphQLInt,
      },
      start: {
        type: GraphQLInt,
      },
    },
    resolve(parent, args) {
      const data = Post.find({}).skip(args.start).limit(args.limit).sort({id: 'asc'});
      return data;
    },
  },
};

module.exports = {
  type: PostType,
  queries: PostQueries,
};
