import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserDoc } from './types';
import { docFlowKit } from './DocFlowKit';

interface UserContextValue {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  createUser: (email: string, displayName?: string) => Promise<User>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    // Check local storage for theme preference
    localStorage.getItem('darkMode') === 'true'
  );

  // Update user preferences
  const updateUserPreferences = useCallback(async (preferences: Partial<User['preferences']>) => {
    if (!currentUser) return;
    
    try {
      const updatedUser: User = {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          ...preferences
        }
      };
      
      const userDoc: UserDoc = {
        docId: currentUser.userId,
        docType: 'User',
        title: `User: ${currentUser.email}`,
        content: updatedUser
      };
      
      await docFlowKit.updateDocument(userDoc);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Error updating user preferences:', err);
    }
  }, [currentUser]);

  // Initialize on component mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Initialize DB
        await docFlowKit.initialize();
        
        // Check for persisted user session
        const savedUserIdString = localStorage.getItem('currentUserId');
        if (savedUserIdString) {
          const userDoc = await docFlowKit.getDocument(savedUserIdString) as UserDoc | null;
          if (userDoc && userDoc.docType === 'User') {
            setCurrentUser(userDoc.content);
          }
        }
      } catch (err) {
        console.error('Error initializing user:', err);
        setError(`Error initializing user: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Update dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    
    // Update user preferences if logged in
    if (currentUser) {
      updateUserPreferences({ darkMode: isDarkMode });
    }
  }, [isDarkMode, currentUser, updateUserPreferences]);

  // Login function
  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Look for existing user with this email
      const allDocs = await docFlowKit.listDocuments();
      const userDoc = allDocs.find(
        doc => doc.docType === 'User' && doc.content.email === email.toLowerCase()
      ) as UserDoc | undefined;
      
      if (userDoc) {
        // In a real app, we would verify the password here
        // For now, we'll just accept the login
        setCurrentUser(userDoc.content);
        localStorage.setItem('currentUserId', userDoc.docId);
      } else {
        // Create new user if not found
        const newUser = await createUser(email);
        setCurrentUser(newUser);
        localStorage.setItem('currentUserId', newUser.userId);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`Login failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  // Create a new user
  const createUser = async (email: string, displayName?: string): Promise<User> => {
    // Create a new user document
    const userId = crypto.randomUUID();
    const user: User = {
      userId,
      email: email.toLowerCase(),
      displayName: displayName || email.split('@')[0],
      projects: [],
      preferences: {
        darkMode: isDarkMode
      }
    };
    
    const userDoc: UserDoc = {
      docId: userId,
      docType: 'User',
      title: `User: ${email}`,
      content: user
    };
    
    await docFlowKit.createDocument(userDoc);
    return user;
  };

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const value: UserContextValue = {
    currentUser,
    isLoading,
    error,
    login,
    logout,
    createUser,
    isDarkMode,
    toggleDarkMode
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 