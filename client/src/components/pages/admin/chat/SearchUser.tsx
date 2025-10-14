import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserSearch = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_SOCKET_BASE_URL;

  // Debounce function to delay API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const searchUsers = async () => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/v1/chat/serach`, { params: { query } });
      setUsers(data);
      // console.log(data)
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of the search function
  const debouncedSearch = debounce(searchUsers, 300);

  useEffect(() => {

    debouncedSearch();
  }, [query]);
  console.log(BASE_URL)

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded-lg px-4 py-2"
        placeholder="Search users..."
      />
      {loading && <p className="mt-2">Loading...</p>}
      <div className="mt-4">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user?._id} className="p-2 border-b cursor-pointer" onClick={() => onUserSelect(user?._id)}>
             <div className=' flex gap-2'>
             <img src={user?.photoUrl} alt="" className=' h-[40px] rounded-full' />
             {user?.name}
             </div>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
