import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import DataTable from 'react-data-table-component';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});


const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

import { useState, useEffect } from 'react';

function Users() {
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [triggeredId, setTriggeredId] = useState('');

  // Query for all users
  const { loading: loadingAll, error: errorAll, data: dataAll } = useQuery(GET_USERS, {
    skip: !!triggeredId,
  });

  // Query for user by ID
  const { loading: loadingById, error: errorById, data: dataById, refetch: refetchById } = useQuery(GET_USER_BY_ID, {
    variables: { id: triggeredId },
    skip: !triggeredId,
  });

  useEffect(() => {
    if (searchId === '') {
      setTriggeredId('');
    }
  }, [searchId]);

  const handleIdSearch = () => {
    if (searchId) {
      setTriggeredId(searchId);
      refetchById({ id: searchId });
    } else {
      setTriggeredId('');
    }
  };

  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
  ];

  let users = [];
  let loading = false;
  let error = null;

  if (triggeredId) {
    loading = loadingById;
    error = errorById;
    users = dataById && dataById.user ? [dataById.user] : [];
  } else {
    loading = loadingAll;
    error = errorAll;
    users = dataAll && dataAll.users ? dataAll.users : [];
    if (searchName) {
      users = users.filter(user => user.name.toLowerCase().includes(searchName.toLowerCase()));
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by ID"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleIdSearch} style={{ marginRight: 16 }}>Search by ID</button>
        <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          disabled={!!triggeredId}
        />
      </div>
      <DataTable
        title="User List"
        columns={columns}
        data={users}
        pagination
      />
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h2>Users</h2>
        <Users />
      </div>
    </ApolloProvider>
  );
}

export default App;
