const graphql = require("graphql")
const mongoose = require("mongoose")
const Member = mongoose.model('Member')
const gravatar = require('gravatar')

const {
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLID,
    GraphQLInt,
    GraphQLList } = graphql;

const MemberType = new GraphQLObjectType({
    name:"Member",
    fields:() => ({ 
        id: { type: GraphQLID },
        name: { type: GraphQLString, required: true },
        email: {type: GraphQLString, required: true},
        password: {type: GraphQLString, required: true},
        username: {type: GraphQLString, required: true},
        birthdate: {type: GraphQLString, required: true},
        country: {type: GraphQLString, required: true},
        pincode: {type: GraphQLInt, required: true},
        bio: {type: GraphQLString},
        gravatar: {type: GraphQLString},
        addressLine1: { type: GraphQLString },
        addressLine2: { type: GraphQLString },
        state: { type: GraphQLString },
        createdOn: {type: GraphQLString, "default": Date.now}
    })
});

const MemberQueries = {
    member:{
        type: MemberType,
        args:{
            id: {
                type: GraphQLID
            }
        },
        resolve(parent, args){ 
            return Member.findById(args.id)
        }
    },
    members: {
        type: new GraphQLList(MemberType),
        args:{
            limit: {
                type: GraphQLInt
            },
            start: {
                type: GraphQLInt
            }
        },
        resolve(parent, args) {
            return Member.find({}).skip(args.start).limit(args.limit).sort({id: 'asc'})
        }
    },
};

const MemberMutations = {
    addMember: {
        type: MemberType,
        args: {
            name: { type: GraphQLString, required: true },
            email: { type: GraphQLString, required: true },
            password: { type: GraphQLString, required: true },
            username: { type: GraphQLString, required: true },
            birthdate: { type: GraphQLString, required: true },
            country: { type: GraphQLString, required: true },
            pincode: { type: GraphQLString, required: true },
            bio: {type: GraphQLString},
            addressLine1: { type: GraphQLString },
            addressLine2: { type: GraphQLString },
            state: { type: GraphQLString },
        },
        resolve(parent,args){
            let member = new Member({
                ...args,
                gravatar: gravatar.url(args.email, {protocol: 'https', s: '100'})
            })
            return member.save()
        }
    },
};

module.exports = {
    type: MemberType,
    queries: MemberQueries,
    mutations: MemberMutations,
};