import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import DataTable from 'react-data-table-component';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});


const GET_USERS_EMPDETAILS = gql`
  query UserWithEmpDetails {
    users {
      id
      name
      email
      company
      salary
    }
  }
`;


const GET_USER_BY_ID = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      company
      salary
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String!, $email: String!, $company: String, $salary: Float) {
    updateUser(id: $id, name: $name, email: $email, company: $company, salary: $salary) {
      id
      name
      email
      company
      salary
    }
  }
`;

import { useState, useEffect } from 'react';

import { useMutation } from '@apollo/client';

function Users() {
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [triggeredId, setTriggeredId] = useState('');
  const [editRowId, setEditRowId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editSalary, setEditSalary] = useState('');

  // Query for all users
  const { loading: loadingAll, error: errorAll, data: dataAll, refetch: refetchAll } = useQuery(GET_USERS_EMPDETAILS, {
    skip: !!triggeredId,
  });

  // Query for user by ID
  const { loading: loadingById, error: errorById, data: dataById, refetch: refetchById } = useQuery(GET_USER_BY_ID, {
    variables: { id: triggeredId },
    skip: !triggeredId,
  });

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);

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

  const handleEdit = (row) => {
    setEditRowId(row.id);
    setEditName(row.name);
    setEditEmail(row.email);
    setEditCompany(row.company || '');
    setEditSalary(row.salary || '');
  };

  const handleSave = async (row) => {
    await updateUser({ variables: { id: row.id, name: editName, email: editEmail, company: editCompany, salary: parseFloat(editSalary) || 0 } });
    setEditRowId(null);
    if (triggeredId) {
      refetchById();
    } else {
      refetchAll();
    }
  };

  const handleCancel = () => {
    setEditRowId(null);
  };

  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
    },
    {
      name: 'Name',
      cell: row =>
        editRowId === row.id ? (
          <input value={editName} onChange={e => setEditName(e.target.value)} />
        ) : (
          row.name
        ),
      sortable: true,
    },
    {
      name: 'Email',
      cell: row =>
        editRowId === row.id ? (
          <input value={editEmail} onChange={e => setEditEmail(e.target.value)} />
        ) : (
          row.email
        ),
      sortable: true,
    },
    {
      name: 'Company',
      cell: row =>
        editRowId === row.id ? (
          <input value={editCompany} onChange={e => setEditCompany(e.target.value)} />
        ) : (
          row.company || ''
        ),
      sortable: true,
    },
    {
      name: 'Salary',
      cell: row =>
        editRowId === row.id ? (
          <input value={editSalary} onChange={e => setEditSalary(e.target.value)} type="number" />
        ) : (
          row.salary !== undefined && row.salary !== null ? row.salary : ''
        ),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row =>
        editRowId === row.id ? (
          <>
            <button onClick={() => handleSave(row)} disabled={updating}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button onClick={() => handleEdit(row)}>Edit</button>
        ),
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
