import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, Layout, List, Settings, Plus, LogOut, 
  ChevronRight, Phone, Mail, FileText, CheckCircle, 
  XCircle, BarChart3, Lock, Eye, EyeOff, Shield, Briefcase
} from 'lucide-react';

// --- TYPES & INTERFACES ---

type RoleType = 'AGENCY_ADMIN' | 'MANAGER' | 'LEAD_RECRUITER' | 'ASSOCIATE';

interface PermissionsConfig {
  sourcing: {
    can_create_lists: boolean;
    can_view_list_analytics: boolean;
  };
  operations: {
    can_create_interviews: boolean;
    can_manage_active_interviews: boolean;
    can_invite_candidates: boolean;
  };
  evaluation: {
    can_view_results_summary: boolean;
    can_view_deep_analytics: boolean;
    can_view_pii: boolean;
  };
  action: {
    can_hire_reject: boolean;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role_type: RoleType;
  parent_user_id?: string;
  permissions_config?: PermissionsConfig; // Only relevant for ASSOCIATE
  avatar?: string;
}

// --- DEFAULT CONFIGS ---

const DEFAULT_ASSOCIATE_PERMISSIONS: PermissionsConfig = {
  sourcing: { can_create_lists: false, can_view_list_analytics: false },
  operations: { can_create_interviews: false, can_manage_active_interviews: false, can_invite_candidates: false },
  evaluation: { can_view_results_summary: false, can_view_deep_analytics: false, can_view_pii: false },
  action: { can_hire_reject: false }
};

// --- MOCK DATA ---

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Jenkins',
    email: 'sarah@flowdot.ai',
    role_type: 'LEAD_RECRUITER',
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: 'u2',
    name: 'Mike Ross',
    email: 'mike@flowdot.ai',
    role_type: 'ASSOCIATE',
    parent_user_id: 'u1',
    avatar: 'https://i.pravatar.cc/150?u=2',
    permissions_config: {
      ...DEFAULT_ASSOCIATE_PERMISSIONS,
      sourcing: { can_create_lists: true, can_view_list_analytics: true }, // Sourcing Specialist Profile
    }
  },
  {
    id: 'u3',
    name: 'Jessica Pearson',
    email: 'jessica@flowdot.ai',
    role_type: 'AGENCY_ADMIN',
    avatar: 'https://i.pravatar.cc/150?u=3'
  }
];

// --- PERMISSION LOGIC ---

const checkPermission = (user: User, section: keyof PermissionsConfig, key: string): boolean => {
  if (['AGENCY_ADMIN', 'MANAGER', 'LEAD_RECRUITER'].includes(user.role_type)) {
    return true; // Full access for higher roles
  }
  if (user.role_type === 'ASSOCIATE' && user.permissions_config) {
    // @ts-ignore
    return user.permissions_config[section]?.[key] === true;
  }
  return false;
};

// --- CONTEXT ---

interface FlowdotContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  addUser: (user: User) => void;
}

const FlowdotContext = createContext<FlowdotContextType | undefined>(undefined);

const FlowdotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default to Lead Recruiter

  const addUser = (user: User) => {
    setUsers([...users, user]);
  };

  return (
    <FlowdotContext.Provider value={{ currentUser, users, setCurrentUser, addUser }}>
      {children}
    </FlowdotContext.Provider>
  );
};

const useFlowdot = () => {
  const context = useContext(FlowdotContext);
  if (!context) throw new Error('useFlowdot must be used within a FlowdotProvider');
  return context;
};

// --- COMPONENTS: PERMISSION GUARD ---

interface PermissionGuardProps {
  section: keyof PermissionsConfig;
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ section, permission, children, fallback = null }) => {
  const { currentUser } = useFlowdot();
  const hasAccess = checkPermission(currentUser, section, permission);

  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
};

// --- COMPONENTS: UI ELEMENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-blue-50 text-blue-700' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

// --- VIEWS ---

const DashboardView = () => {
  const { currentUser } = useFlowdot();
  
  // Mock Interviews Data
  const candidates = [
    { id: 1, name: 'Alex Johnson', role: 'Senior React Dev', score: 92, status: 'Active', phone: '+1 (555) 123-4567', email: 'alex.j@example.com' },
    { id: 2, name: 'Sam Smith', role: 'Product Manager', score: 78, status: 'Review', phone: '+1 (555) 987-6543', email: 'sam.s@example.com' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Interviews</h1>
          <p className="text-gray-500 mt-1">Monitor and control all your AI interviews in one place.</p>
        </div>
        
        <PermissionGuard section="operations" permission="can_create_interviews">
          <button className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm">
            <Plus size={18} />
            <span>Create New Interview</span>
          </button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active Interviews', value: '2' },
          { label: 'Total Candidates', value: '14' },
          { label: 'This Week', value: '5' },
          { label: 'Avg. Duration', value: '28m' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">Recent Candidates</h3>
          <div className="text-sm text-gray-500">Showing latest</div>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {candidates.map(candidate => (
            <div key={candidate.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                    <p className="text-sm text-gray-500">{candidate.role}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${candidate.score > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  AI Score: {candidate.score}
                </div>
              </div>

              {/* RADAR CHART AREA - PERMISSION GUARDED */}
              <div className="relative h-40 bg-slate-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <PermissionGuard 
                  section="evaluation" 
                  permission="can_view_results_summary"
                  fallback={
                    <div className="absolute inset-0 bg-gray-100/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 border border-gray-200 rounded-lg">
                      <Lock className="text-gray-400 mb-2" size={24} />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Results Restricted</span>
                    </div>
                  }
                >
                  {/* Simulated Radar Chart */}
                  <svg viewBox="0 0 100 100" className="w-full h-full opacity-75">
                     <polygon points="50,10 90,40 80,80 20,80 10,40" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
                     <line x1="50" y1="50" x2="50" y2="10" stroke="#cbd5e1" />
                     <line x1="50" y1="50" x2="90" y2="40" stroke="#cbd5e1" />
                     <line x1="50" y1="50" x2="80" y2="80" stroke="#cbd5e1" />
                     <line x1="50" y1="50" x2="20" y2="80" stroke="#cbd5e1" />
                     <line x1="50" y1="50" x2="10" y2="40" stroke="#cbd5e1" />
                  </svg>
                  <div className="absolute text-xs font-medium text-slate-400 bottom-2">Competency Map</div>
                </PermissionGuard>
              </div>

              {/* PII AREA - PERMISSION GUARDED */}
              <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
                <div className="flex items-center text-gray-600">
                  <Phone size={14} className="mr-2 opacity-75" />
                  <PermissionGuard section="evaluation" permission="can_view_pii" fallback={<span className="font-mono text-gray-400">+1 (***) ***-****</span>}>
                    <span>{candidate.phone}</span>
                  </PermissionGuard>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail size={14} className="mr-2 opacity-75" />
                  <PermissionGuard section="evaluation" permission="can_view_pii" fallback={<span className="font-mono text-gray-400">e***@****.com</span>}>
                    <span>{candidate.email}</span>
                  </PermissionGuard>
                </div>
              </div>

              {/* ACTION AREA - PERMISSION GUARDED */}
              <div className="flex space-x-3">
                 <button 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                    !checkPermission(currentUser, 'evaluation', 'can_view_deep_analytics') 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={!checkPermission(currentUser, 'evaluation', 'can_view_deep_analytics')}
                >
                  View Details
                </button>
                <PermissionGuard section="action" permission="can_hire_reject">
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                    Hire
                  </button>
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ListsView = () => (
  <div className="p-8 max-w-7xl mx-auto">
     <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Lists</h1>
          <p className="text-gray-500 mt-1">Manage your sourced candidates.</p>
        </div>
        <PermissionGuard section="sourcing" permission="can_create_lists">
           <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm">
            <Plus size={18} />
            <span>Create New List</span>
          </button>
        </PermissionGuard>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
         <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
           <List size={32} />
         </div>
         <h3 className="text-lg font-medium text-gray-900">Your Lists</h3>
         <p>You have access to view sourced candidate lists.</p>
      </div>
  </div>
);

const SettingsView = () => {
  const { currentUser, users, addUser } = useFlowdot();
  
  // Form State
  const [activeTab, setActiveTab] = useState('team');
  const [isAdding, setIsAdding] = useState(false);
  const [newUserRole, setNewUserRole] = useState<RoleType>('ASSOCIATE');
  const [newUserName, setNewUserName] = useState('');
  const [permissions, setPermissions] = useState<PermissionsConfig>(DEFAULT_ASSOCIATE_PERMISSIONS);

  // Preset Handlers
  const applyPreset = (preset: 'SOURCING' | 'REVIEWER' | 'CUSTOM') => {
    let newPerms = JSON.parse(JSON.stringify(DEFAULT_ASSOCIATE_PERMISSIONS));
    
    if (preset === 'SOURCING') {
      newPerms.sourcing.can_create_lists = true;
      newPerms.sourcing.can_view_list_analytics = true;
    }
    if (preset === 'REVIEWER') {
      newPerms.evaluation.can_view_results_summary = true;
      newPerms.evaluation.can_view_deep_analytics = true;
    }
    setPermissions(newPerms);
  };

  const togglePermission = (section: keyof PermissionsConfig, key: string) => {
    setPermissions(prev => ({
      ...prev,
      [section]: {
        // @ts-ignore
        ...prev[section],
        // @ts-ignore
        [key]: !prev[section][key]
      }
    }));
  };

  const handleAddUser = () => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name: newUserName || 'New Member',
      email: `${newUserName.toLowerCase().replace(' ', '.')}@flowdot.ai`,
      role_type: newUserRole,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      parent_user_id: currentUser.id,
      permissions_config: newUserRole === 'ASSOCIATE' ? permissions : undefined
    };
    addUser(newUser);
    setIsAdding(false);
    setNewUserName('');
  };

  // Only Leads/Admins can see this
  if (currentUser.role_type === 'ASSOCIATE') {
    return (
      <div className="flex items-center justify-center h-full p-20">
         <div className="text-center">
            <Lock size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
            <p className="text-gray-500">You do not have permission to view Team Management.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="flex border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('team')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'team' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Team Management
        </button>
        <button 
           onClick={() => setActiveTab('billing')}
           className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'billing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Billing & Agency
        </button>
      </div>

      {activeTab === 'team' && (
        <>
          {!isAdding ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                <div>
                  <h3 className="font-semibold text-gray-800">Team Members</h3>
                  <p className="text-sm text-gray-500">Manage access and roles.</p>
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                  Add Member
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {users.map(user => (
                  <div key={user.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-200" />
                      <div>
                        <div className="font-medium text-gray-900">{user.name} {user.id === currentUser.id && '(You)'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role_type === 'AGENCY_ADMIN' ? 'bg-purple-100 text-purple-700' : user.role_type === 'LEAD_RECRUITER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role_type.replace('_', ' ')}
                      </span>
                      {user.role_type === 'ASSOCIATE' && (
                        <span className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded">
                          Custom Permissions
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Add Team Member</h3>
                <button onClick={() => setIsAdding(false)}><XCircle className="text-gray-400 hover:text-gray-600" /></button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      placeholder="e.g. Jane Doe"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newUserRole}
                      // @ts-ignore
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      <option value="ASSOCIATE">Associate (Restricted)</option>
                      <option value="LEAD_RECRUITER">Lead Recruiter</option>
                      <option value="MANAGER">Manager</option>
                      <option value="AGENCY_ADMIN">Agency Admin</option>
                    </select>
                  </div>
                  
                  {newUserRole === 'ASSOCIATE' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Quick Presets</h4>
                      <div className="space-y-2">
                        <button onClick={() => applyPreset('SOURCING')} className="w-full text-left px-3 py-2 bg-white rounded border border-blue-200 text-sm hover:bg-blue-50 text-blue-800 transition-colors">
                          <span className="font-semibold block">Sourcing Specialist</span>
                          <span className="text-xs text-blue-500">Can create lists & view sourcing analytics</span>
                        </button>
                        <button onClick={() => applyPreset('REVIEWER')} className="w-full text-left px-3 py-2 bg-white rounded border border-blue-200 text-sm hover:bg-blue-50 text-blue-800 transition-colors">
                          <span className="font-semibold block">Reviewer</span>
                          <span className="text-xs text-blue-500">Can view results summary & deep analytics</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Permission Checklist */}
                {newUserRole === 'ASSOCIATE' ? (
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Permission Checklist</h4>
                    
                    <div className="space-y-6">
                      {/* Sourcing Section */}
                      <div>
                        <h5 className="text-xs font-semibold text-gray-500 mb-2 flex items-center"><Briefcase size={12} className="mr-1"/> SOURCING</h5>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={permissions.sourcing.can_create_lists} onChange={() => togglePermission('sourcing', 'can_create_lists')} className="rounded text-blue-600 focus:ring-blue-500" />
                            <span>Can Create Lists</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={permissions.sourcing.can_view_list_analytics} onChange={() => togglePermission('sourcing', 'can_view_list_analytics')} className="rounded text-blue-600 focus:ring-blue-500" />
                            <span>View List Analytics</span>
                          </label>
                        </div>
                      </div>

                       {/* Operations Section */}
                       <div>
                        <h5 className="text-xs font-semibold text-gray-500 mb-2 flex items-center"><Settings size={12} className="mr-1"/> OPERATIONS</h5>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={permissions.operations.can_create_interviews} onChange={() => togglePermission('operations', 'can_create_interviews')} className="rounded text-blue-600 focus:ring-blue-500" />
                            <span>Create Interviews</span>
                          </label>
                        </div>
                      </div>

                      {/* Evaluation Section */}
                      <div>
                        <h5 className="text-xs font-semibold text-gray-500 mb-2 flex items-center"><BarChart3 size={12} className="mr-1"/> EVALUATION</h5>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={permissions.evaluation.can_view_results_summary} onChange={() => togglePermission('evaluation', 'can_view_results_summary')} className="rounded text-blue-600 focus:ring-blue-500" />
                            <span>View Results Summary (Charts)</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={permissions.evaluation.can_view_deep_analytics} onChange={() => togglePermission('evaluation', 'can_view_deep_analytics')} className="rounded text-blue-600 focus:ring-blue-500" />
                            <span>View Deep Analytics (Details)</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={permissions.evaluation.can_view_pii} onChange={() => togglePermission('evaluation', 'can_view_pii')} className="rounded text-blue-600 focus:ring-blue-500" />
                            <span>View PII (Phone/Email)</span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Action Section */}
                      <div>
                        <h5 className="text-xs font-semibold text-gray-500 mb-2 flex items-center"><CheckCircle size={12} className="mr-1"/> ACTION</h5>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={permissions.action.can_hire_reject} onChange={() => togglePermission('action', 'can_hire_reject')} className="rounded text-blue-600 focus:ring-blue-500" />
                            <span>Can Hire/Reject</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                   <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 p-8">
                      <div className="text-center">
                        <Shield size={40} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">This role has full system access.</p>
                      </div>
                   </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                 <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
                 <button onClick={handleAddUser} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">Save Member</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- MAIN LAYOUT & ROUTING ---

const AppContent = () => {
  const [currentView, setCurrentView] = useState('interviews');
  const { currentUser, setCurrentUser, users } = useFlowdot();

  // Navigation Logic based on permissions
  const canViewLists = checkPermission(currentUser, 'sourcing', 'can_create_lists') || checkPermission(currentUser, 'sourcing', 'can_view_list_analytics');

  useEffect(() => {
    // Redirect if current view is forbidden
    if (currentView === 'lists' && !canViewLists) {
      setCurrentView('interviews');
    }
  }, [currentUser, canViewLists, currentView]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Flowdot AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="mb-6 px-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</p>
             <div className="space-y-1">
               <SidebarItem 
                  icon={Briefcase} 
                  label="Interviews" 
                  active={currentView === 'interviews'} 
                  onClick={() => setCurrentView('interviews')} 
                />
                
                {canViewLists && (
                  <SidebarItem 
                    icon={List} 
                    label="Lists" 
                    active={currentView === 'lists'} 
                    onClick={() => setCurrentView('lists')} 
                  />
                )}
             </div>
          </div>
          
          <div className="px-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
             <SidebarItem 
                icon={Settings} 
                label="Settings" 
                active={currentView === 'settings'} 
                onClick={() => setCurrentView('settings')} 
              />
          </div>
        </nav>

        {/* User Switcher for Demo Purposes */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 mb-3">
             <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full" />
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.role_type}</p>
             </div>
          </div>
          <select 
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
            value={currentUser.id}
            onChange={(e) => {
              const u = users.find(u => u.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>Switch to: {u.role_type} ({u.name.split(' ')[0]})</option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-8">
           <div className="text-sm breadcrumbs text-gray-500">
              <span className="text-gray-900 font-medium capitalize">{currentView}</span>
           </div>
           <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-500 hover:text-gray-900">Help</button>
              <div className="w-px h-4 bg-gray-300"></div>
              <button className="flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-700">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
           </div>
        </header>

        <div className="min-h-[calc(100vh-64px)]">
          {currentView === 'interviews' && <DashboardView />}
          {currentView === 'lists' && <ListsView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <FlowdotProvider>
      <AppContent />
    </FlowdotProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
