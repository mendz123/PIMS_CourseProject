import React, { useState, useEffect, useMemo } from "react";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import { groupService, type TeacherGroupDto } from "../../services/groupService";
import { semesterService, type SemesterDto } from "../../services/semesterService";
import UserInfoDrawer from "../../components/shared/UserInfoDrawer";
import { useAuth } from "../../context/AuthContext";
import "../../components/admin/UserManagement.css";

// A flattened interface containing student info + group/semester context
interface FlattenedStudent {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string; // We might not have avatar in TeacherGroupDto directly, we can just use initials
  groupId: number;
  groupName: string;
  semesterName: string;
  topicName: string;
}

const TeacherStudentListPage: React.FC = () => {
  const { user } = useAuth();
  
  // Data states
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [groups, setGroups] = useState<TeacherGroupDto[]>([]);
  
  // Filter states
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | "">("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Drawer state
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Load semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await semesterService.getAllSemesters();
        if (response.success && response.data) {
          setSemesters(response.data);
          // Auto-select active semester if none selected
          const active = response.data.find(s => s.isActive);
          if (active) {
            setSelectedSemesterId(active.semesterId);
          }
        }
      } catch (err) {
        console.error("Failed to load semesters", err);
        setError("Failed to load semesters.");
      }
    };
    fetchSemesters();
  }, []);

  // Fetch groups when semester changes
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        // If "ALL" (-1 or empty) is possible, handle it. Currently the API supports filtering by an ID, or all if not provided
        const semId = selectedSemesterId === "" ? undefined : Number(selectedSemesterId);
        const response = await groupService.getGroupsByTeacher(semId);
        
        if (response && response.success) {
          setGroups(response.data || []);
        } else {
          setGroups([]);
        }
      } catch (err) {
        console.error("Failed to fetch teacher groups", err);
        setError("Failed to fetch student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [selectedSemesterId]);

  // Flatten and filter students
  const filteredStudents = useMemo(() => {
    let result: FlattenedStudent[] = [];
    
    // Flatten
    groups.forEach((g) => {
      // Group filter check
      if (selectedGroupId !== "" && g.groupId !== Number(selectedGroupId)) return;
      
      // Topic filter check
      if (topicFilter && g.topicName && !g.topicName.toLowerCase().includes(topicFilter.toLowerCase())) return;

      g.students.forEach((student) => {
        // Name search check
        if (searchTerm && !student.fullName.toLowerCase().includes(searchTerm.toLowerCase())) return;

        result.push({
          userId: student.userId,
          fullName: student.fullName,
          // If the backend doesn't send email/avatar through TeacherGroupMemberDto, 
          // we might just display placeholders or "-".
          email: "-", 
          groupId: g.groupId,
          groupName: g.groupName,
          semesterName: g.semesterName || "Unknown",
          topicName: g.topicName || "No Topic"
        });
      });
    });

    return result;
  }, [groups, selectedGroupId, topicFilter, searchTerm]);

  // Pagination calculation
  const totalCount = filteredStudents.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  useEffect(() => {
    // Reset page if filters change
    setCurrentPage(1);
  }, [selectedSemesterId, selectedGroupId, searchTerm, topicFilter]);

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
      <TeacherSidebar currentPath="/teacher/students" />

      <main className="flex-1 overflow-y-auto bg-[#f6f6f8] flex flex-col">
        <TeacherHeader
          title="Mentored Students List"
          subtitle={`View and manage students in your mentored groups.`}
        />

        <div className="p-8 max-w-[1200px] mx-auto w-full flex-1">
          <div className="user-management-container bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="search-filter-bar mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="search-input-wrapper w-full relative col-span-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none bg-white"
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">All Semesters</option>
                {semesters.map((sem) => (
                  <option key={sem.semesterId} value={sem.semesterId}>
                    {sem.semesterName}
                  </option>
                ))}
              </select>

              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none bg-white"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">All Groups</option>
                {groups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.groupName}
                  </option>
                ))}
              </select>

               <div className="search-input-wrapper w-full relative col-span-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  topic
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="Filter by topic..."
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col">
              {loading ? (
                <div className="text-center py-12 flex-1 flex items-center justify-center">
                  <p className="text-[#616f89] flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Loading students...
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <span className="material-symbols-outlined text-gray-400 text-3xl">search_off</span>
                  </div>
                  <p className="text-[#616f89] font-medium">No students found matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="user-table w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] border-b border-[#dbdfe6]">
                      <tr>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Group
                        </th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                         <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[120px]">
                          Semester
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dbdfe6]">
                      {currentStudents.map((student) => (
                        <tr
                          key={`${student.groupId}-${student.userId}`}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0 border border-primary/20">
                                <span>{getInitials(student.fullName)}</span>
                              </div>
                              <div className="min-w-0">
                                <button
                                  className="font-bold text-sm text-[#111318] hover:text-primary transition-colors text-left truncate flex"
                                  onClick={() => {
                                    setSelectedUserId(student.userId);
                                    setShowUserDrawer(true);
                                  }}
                                  title="View student details"
                                >
                                  {student.fullName}
                                </button>
                                <div className="text-xs text-[#616f89] truncate">
                                  ID: {student.userId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                               <span className="material-symbols-outlined text-[14px]">groups</span>
                               {student.groupName}
                            </span>
                          </td>
                           <td className="p-4">
                            <p className="text-sm text-[#111318] line-clamp-2" title={student.topicName}>
                               {student.topicName}
                            </p>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="text-sm text-[#616f89]">
                              {student.semesterName}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pagination flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{totalCount > 0 ? startIndex + 1 : 0}</span>{" "}
                to <span className="font-bold text-gray-900">{endIndex}</span> of{" "}
                <span className="font-bold text-gray-900">{totalCount}</span>{" "}
                results
              </span>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    className="p-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    <span className="material-symbols-outlined text-sm block">
                      chevron_left
                    </span>
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
                          currentPage === i + 1
                            ? "bg-primary text-white shadow-sm ring-1 ring-primary"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    className="p-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    <span className="material-symbols-outlined text-sm block">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <UserInfoDrawer
        userId={selectedUserId}
        isOpen={showUserDrawer}
        onClose={() => setShowUserDrawer(false)}
      />
    </div>
  );
};

export default TeacherStudentListPage;
