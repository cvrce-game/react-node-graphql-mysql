const { gql } = require('apollo-server');
const pool = require('./db');

const typeDefs = gql`

  type User {
    id: ID!
    name: String!
    email: String!
    company: String
    salary: Float
  }

  type EmploymentDetails {
    id: ID!
    companyname: String
    salary: Float
  }

  type Query {
    users: [User]
    user(id: ID!): User
      employmentdetails: [EmploymentDetails]
      employmentdetail(id: ID!): EmploymentDetails
  }
  type UserWithEmpDetails{
    user: User
    employmentDetails: EmploymentDetails
  }

  type Mutation {
    updateUser(id: ID!, name: String!, email: String!, company: String, salary: Float): User
  }
`;

const resolvers = {
  Query: {
    users: async () => {
      const [rows] = await pool.query(`
        SELECT u.id, u.name, u.email, e.companyname AS company, e.salary
        FROM users u
        LEFT JOIN employmentdetails e ON u.id = e.id
      `);
      return rows;
    },
    user: async (_, { id }) => {
      const [rows] = await pool.query(`
        SELECT u.id, u.name, u.email, e.companyname AS company, e.salary
        FROM users u
        LEFT JOIN employmentdetails e ON u.id = e.id
        WHERE u.id = ?
      `, [id]);
      return rows[0];
    },
    employmentdetails: async () => {
      const [rows] = await pool.query('SELECT * FROM employmentdetails');
      return rows;
    },
    employmentdetail: async (_, { id }) => {
      const [rows] = await pool.query('SELECT * FROM employmentdetails WHERE id = ?', [id]);
      return rows[0];
    },
  },
  Mutation: {
    updateUser: async (_, { id, name, email, company, salary }) => {
      // Update users and employmentdetails tables using JOIN
      await pool.query(
        `UPDATE users u
         JOIN employmentdetails e ON u.id = e.id
         SET
           u.name = ?,
           u.email = ?,
           e.companyname = ?,
           e.salary = ?
         WHERE u.id = ?`,
        [name, email, company, salary, id]
      );
      // Fetch updated user info (assuming you want to return combined info)
      const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, e.companyname AS company, e.salary
         FROM users u
         JOIN employmentdetails e ON u.id = e.id
         WHERE u.id = ?`,
        [id]
      );
      return rows[0];
    },
  },
};

module.exports = { typeDefs, resolvers };
