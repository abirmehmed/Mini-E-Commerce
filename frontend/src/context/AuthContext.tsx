// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// type User = {
//   id: number;
//   email: string;
//   fullName: string;
//   streetAddress?: string;
//   city?: string;
//   zipCode?: string;
//   state?: string;
//   phone?: string;
//   role?: string;
// };

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const API_BASE_URL = 'http://localhost:5000/api';

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           const { data } = await axios.get(`${API_BASE_URL}/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` }
//           });
//           setUser(data.user || data); // Handle both response formats
//         }
//       } catch (err) {
//         console.error('Failed to load user', err);
//         localStorage.removeItem('token');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadUser();
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       const { data } = await axios.post(`${API_BASE_URL}/auth/signin`, { email, password });
//       localStorage.setItem('token', data.token);
//       setUser(data.user);
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw error;
//     }
//   };

//   const register = async (userData: Omit<User, 'id'> & { password: string }) => {
//     try {
//       const { data } = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
//       localStorage.setItem('token', data.token);
//       setUser(data.user);
//     } catch (error) {
//       console.error('Registration failed:', error);
//       throw error;
//     }
//   };


//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//     navigate('/');
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// }