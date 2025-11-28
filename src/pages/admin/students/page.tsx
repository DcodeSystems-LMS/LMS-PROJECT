
import React, { useState, useEffect } from 'react';
import AddStudentModal from '@/pages/student/resume-builder/components/AddStudentModal';
import Modal from '@/components/base/Modal';
import DataService from '@/services/dataService';
import type { ExtendedProfile } from '@/services/dataService';
import { useRealtimeProfiles } from '@/hooks/useRealtimeData';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';

const AdminStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ExtendedProfile | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  
  // Use real-time data
  const { profiles, loading, error, lastUpdate } = useRealtimeProfiles();
  
  // Filter students from all profiles and enhance with enrollment data
  const students = profiles
    .filter(profile => profile.role === 'student')
    .map(student => {
      const studentEnrollments = enrollments.filter(e => e.student_id === student.id);
      const latestEnrollment = studentEnrollments.sort((a, b) => 
        new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
      )[0];
      
      return {
        ...student,
        course: latestEnrollment?.course?.title || 'No course enrolled',
        progress: student.progress || latestEnrollment?.progress || 0,
        status: student.student_status || (studentEnrollments.length > 0 ? 'active' : 'inactive'),
        joinDate: student.join_date || latestEnrollment?.enrolled_at || student.created_at,
        lastActive: student.last_active || student.updated_at,
        phone: student.phone || '+1 (555) 000-0000',
        address: student.address || 'Address not provided'
      };
    });

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const enrollmentsData = await DataService.getEnrollments();
        setEnrollments(enrollmentsData);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SimpleDCODESpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading students: {error}
      </div>
    );
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.course && student.course.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Real-time data automatically updates, no need for manual state updates

  const handleViewStudent = (student: any) => {
    // Find the current student data from the real-time students array
    const currentStudent = students.find(s => s.id === student.id) || student;
    console.log('🔍 Viewing student:', currentStudent);
    setSelectedStudent(currentStudent);
    setShowViewModal(true);
  };

  const handleEditStudent = (student: any) => {
    // Find the current student data from the real-time students array
    const currentStudent = students.find(s => s.id === student.id) || student;
    setSelectedStudent(currentStudent);
    setShowEditModal(true);
  };

  const handleDeleteStudent = (student: any) => {
    // Find the current student data from the real-time students array
    const currentStudent = students.find(s => s.id === student.id) || student;
    setSelectedStudent(currentStudent);
    setShowDeleteModal(true);
  };

  const confirmDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    setIsDeletingStudent(true);
    try {
      console.log('🗑️ Deleting student:', selectedStudent.id);
      
      const { error } = await DataService.deleteProfile(selectedStudent.id);
      
      if (error) {
        console.error('❌ Error deleting student:', error);
        alert(`Failed to delete student: ${error.message || 'Unknown error'}`);
        return;
      }
      
      console.log('✅ Student deleted successfully');
      setShowDeleteModal(false);
      setSelectedStudent(null);
      
      // Show success message
      alert('Student deleted successfully!');
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert('An unexpected error occurred while deleting the student');
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleUpdateStudent = async (updatedStudent: any) => {
    try {
      console.log('🔄 Starting student update...');
      console.log('📝 Student ID:', updatedStudent.id);
      console.log('📝 Update data:', {
        name: updatedStudent.name,
        email: updatedStudent.email,
        phone: updatedStudent.phone,
        address: updatedStudent.address,
        student_status: updatedStudent.status,
        progress: updatedStudent.progress
      });

      // Update the profile in the database with all fields
      const { data, error } = await DataService.updateProfile(updatedStudent.id, {
        name: updatedStudent.name,
        email: updatedStudent.email,
        phone: updatedStudent.phone,
        address: updatedStudent.address,
        student_status: updatedStudent.status,
        progress: updatedStudent.progress,
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('📊 Update result:', { data, error });

      if (error) {
        console.error('❌ Error updating student:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        alert(`Failed to update student: ${error.message}`);
        return;
      }

      console.log('✅ Student updated successfully:', data);
      
      // Verify the update by fetching the updated profile
      console.log('🔍 Verifying update...');
      const { data: verifyData, error: verifyError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', updatedStudent.id)
        .single();

      if (verifyError) {
        console.warn('⚠️ Could not verify update:', verifyError);
      } else {
        console.log('✅ Update verified:', verifyData);
      }

      setShowEditModal(false);
      
      // Refresh the selected student data to show updated information
      const refreshedStudent = students.find(s => s.id === updatedStudent.id);
      if (refreshedStudent) {
        console.log('🔄 Refreshing selected student with updated data:', refreshedStudent);
        setSelectedStudent(refreshedStudent);
      }
      
      // Show success message
      alert('Student updated successfully! All fields have been saved to the database.');
      
    } catch (error) {
      console.error('❌ Unexpected error updating student:', error);
      alert('Failed to update student. Please try again.');
    }
  };

  const handleAddStudent = async (newStudent: any) => {
    try {
      setIsAddingStudent(true);
      console.log('🔄 Adding new student...');
      console.log('📝 Student data:', newStudent);

      // Generate a UUID for the new student
      const studentId = crypto.randomUUID();
      
      // Insert directly into profiles table
      console.log('📋 Inserting student profile...');
      const { data, error } = await window.supabase
        .from('profiles')
        .insert({
          id: studentId,
          name: newStudent.name,
          email: newStudent.email,
          phone: newStudent.phone,
          address: newStudent.address,
          role: 'student',
          student_status: 'active',
          progress: 0,
          course_id: null,
          join_date: new Date().toISOString(),
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      console.log('📊 Insert result:', { data, error });

      if (error) {
        console.error('❌ Error adding student:', error);
        alert(`Failed to add student: ${error.message}`);
        return;
      }

      console.log('✅ Student added successfully:', data);

      // Close the modal
      setShowAddModal(false);

      // Show success message
      alert('Student added successfully! The new student will appear in the list.');

    } catch (error) {
      console.error('❌ Unexpected error adding student:', error);
      alert('Failed to add student. Please try again.');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor student accounts and progress</p>
        {lastUpdate && (
          <p className="text-xs text-gray-500 mt-1">
            <i className="ri-refresh-line mr-1"></i>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 mt-1">
            <i className="ri-error-warning-line mr-1"></i>
            Real-time sync error: {error}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg mr-4">
              <i className="ri-user-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg mr-4">
              <i className="ri-user-check-line text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-lg mr-4">
              <i className="ri-user-star-line text-2xl text-yellow-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">High Performers</p>
              <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.progress >= 80).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-lg mr-4">
              <i className="ri-user-unfollow-line text-2xl text-red-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.progress < 20 && s.status === 'active').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-add-line mr-2"></i>
            Add Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">{student.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.course}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-0">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.joinDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.lastActive}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewStudent(student)}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      <button 
                        onClick={() => handleEditStudent(student)}
                        className="text-green-600 hover:text-green-700 cursor-pointer"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student)}
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                        title="Delete student"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {filteredStudents.length} of {students.length} students
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            Previous
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 cursor-pointer whitespace-nowrap">
            1
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            2
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            3
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            Next
          </button>
        </div>
      </div>

      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStudent}
        isLoading={isAddingStudent}
      />

      {/* View Student Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Student Details"
        key={selectedStudent?.id} // Force re-render when student changes
      >
        {selectedStudent && (() => {
          // Always get the latest student data from the real-time students array
          const currentStudent = students.find(s => s.id === selectedStudent.id) || selectedStudent;
          console.log('🔄 Modal rendering with current student:', currentStudent);
          
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">{currentStudent.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{currentStudent.name}</h3>
                  <p className="text-gray-600">{currentStudent.email}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(currentStudent.status)}`}>
                    {currentStudent.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <i className="ri-phone-line text-gray-400 mr-2"></i>
                      <span className="text-sm text-gray-600">{currentStudent.phone}</span>
                    </div>
                    <div className="flex items-start">
                      <i className="ri-map-pin-line text-gray-400 mr-2 mt-0.5"></i>
                      <span className="text-sm text-gray-600">{currentStudent.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Course Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <i className="ri-book-line text-gray-400 mr-2"></i>
                      <span className="text-sm text-gray-600">{currentStudent.course}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-calendar-line text-gray-400 mr-2"></i>
                      <span className="text-sm text-gray-600">Joined: {currentStudent.joinDate}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-time-line text-gray-400 mr-2"></i>
                      <span className="text-sm text-gray-600">Last active: {currentStudent.lastActive}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Progress</h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-3 mr-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(currentStudent.progress)}`}
                      style={{ width: `${currentStudent.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{currentStudent.progress}%</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    console.log('🔄 Refreshing student data...');
                    // Force refresh by finding the latest data
                    const refreshedStudent = students.find(s => s.id === selectedStudent.id);
                    if (refreshedStudent) {
                      console.log('✅ Found refreshed student:', refreshedStudent);
                      setSelectedStudent(refreshedStudent);
                    } else {
                      console.log('⚠️ No refreshed student found');
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Refresh
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Student"
      >
        {selectedStudent && (
          <EditStudentForm
            student={selectedStudent}
            onSave={handleUpdateStudent}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-delete-bin-line text-red-600 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Delete Student</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="ri-error-warning-line text-red-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Are you sure you want to delete this student?
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      <strong>{selectedStudent.name}</strong> ({selectedStudent.email}) will be permanently removed from the system.
                    </p>
                    <p className="mt-1">
                      This will also delete all associated data including enrollments, sessions, and progress records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingStudent}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStudent}
                disabled={isDeletingStudent}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isDeletingStudent ? (
                  <>
                    <SimpleDCODESpinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line mr-2"></i>
                    Delete Student
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Edit Student Form Component
const EditStudentForm: React.FC<{
  student: any;
  onSave: (student: any) => void;
  onCancel: () => void;
}> = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone || '+1 (555) 000-0000',
    address: student.address || 'Address not provided',
    course: student.course || 'No course enrolled',
    status: student.status || 'inactive',
    progress: student.progress || 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({ ...student, ...formData });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-check-line text-green-600 mr-2 mt-0.5"></i>
          <div className="text-sm text-green-800">
            <p className="font-medium">All Fields Will Be Saved:</p>
            <p><strong>Name</strong>, <strong>Email</strong>, <strong>Phone</strong>, <strong>Address</strong>, <strong>Status</strong>, and <strong>Progress</strong> will all be saved to the database.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
          <input
            type="number"
            name="progress"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <SimpleDCODESpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminStudents;
