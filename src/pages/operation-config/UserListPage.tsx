import React, { useState, useMemo } from 'react';
import { User, UserFilterParams } from '@/types/user';
import { MOCK_USERS } from '@/mocks/users';
import { UserFilterCard } from '@/components/user/UserFilterCard';
import { UserTable, SortField, InlineFilters } from '@/components/user/UserTable';
import { UserPagination } from '@/components/user/UserPagination';
import { UserFormModal } from '@/components/user/UserFormModal';
import { UserImportModal } from '@/components/user/UserImportModal';
import { UserImeiModal } from '@/components/user/UserImeiModal';
import { ConfirmModal } from '@/components/user/ConfirmModal';
import { exportUsersToCsv, downloadTemplateCsv } from '@/utils/csv';
import { formatDateToDMY } from '@/utils/date';
import { useI18n } from '@/context/I18nContext';

const INITIAL_INLINE_FILTERS: InlineFilters = {
  region: '',
  workProvince: '',
  newWorkProvince: '',
  employeeCode: '',
  currentSupervisorName: '',
  fullName: '',
  identityNumber: '',
  currentPosition: '',
  username: '',
  employmentStatus: '',
  joinDate: '',
  resignDate: '',
};

export const UserListPage: React.FC = () => {
  const { t } = useI18n();
  // Master users state
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // Top Filter state
  const [filterParams, setFilterParams] = useState<UserFilterParams>({});
  const [appliedFilters, setAppliedFilters] = useState<UserFilterParams>({});

  // Inline column filter state
  const [inlineFilters, setInlineFilters] = useState<InlineFilters>(INITIAL_INLINE_FILTERS);

  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state (default 20 entries per SPEC-05 Section 4.1)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [imeiModalOpen, setImeiModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  // Extract supervisors list for dropdowns
  const supervisors = useMemo(() => {
    return users.filter((u) => u.currentPosition === 'Supervisor' || u.currentPosition === 'Admin');
  }, [users]);

  // Handle Search Trigger
  const handleSearch = () => {
    setAppliedFilters({ ...filterParams });
    setCurrentPage(1);
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    setFilterParams({});
    setAppliedFilters({});
    setInlineFilters(INITIAL_INLINE_FILTERS);
    setCurrentPage(1);
  };

  // Handle Inline Filter change
  const handleInlineFilterChange = (field: keyof InlineFilters, value: string) => {
    setInlineFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  // Handle Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered & Sorted Records
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Top Filters Check
      if (appliedFilters.position && u.currentPosition !== appliedFilters.position) {
        return false;
      }
      if (appliedFilters.supervisorId && u.currentSupervisorId !== appliedFilters.supervisorId) {
        return false;
      }
      if (
        appliedFilters.employeeCode &&
        !u.employeeCode.toLowerCase().includes(appliedFilters.employeeCode.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.fullName &&
        !u.fullName.toLowerCase().includes(appliedFilters.fullName.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.username &&
        !u.username.toLowerCase().includes(appliedFilters.username.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.phoneNumber &&
        !u.phoneNumber.includes(appliedFilters.phoneNumber)
      ) {
        return false;
      }
      if (
        appliedFilters.identityNumber &&
        !u.identityNumber.includes(appliedFilters.identityNumber)
      ) {
        return false;
      }
      if (
        appliedFilters.employmentStatus &&
        u.employmentStatus !== appliedFilters.employmentStatus
      ) {
        return false;
      }

      // 2. Inline Filters Check
      if (
        inlineFilters.region &&
        !u.region.toLowerCase().includes(inlineFilters.region.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.workProvince &&
        !u.workProvince.toLowerCase().includes(inlineFilters.workProvince.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.newWorkProvince &&
        !(u.newWorkProvince || '').toLowerCase().includes(inlineFilters.newWorkProvince.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.employeeCode &&
        !u.employeeCode.toLowerCase().includes(inlineFilters.employeeCode.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.currentSupervisorName &&
        !(u.currentSupervisorName || '')
          .toLowerCase()
          .includes(inlineFilters.currentSupervisorName.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.fullName &&
        !u.fullName.toLowerCase().includes(inlineFilters.fullName.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.identityNumber &&
        !u.identityNumber.includes(inlineFilters.identityNumber)
      ) {
        return false;
      }
      if (
        inlineFilters.currentPosition &&
        !u.currentPosition.toLowerCase().includes(inlineFilters.currentPosition.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.username &&
        !u.username.toLowerCase().includes(inlineFilters.username.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.employmentStatus &&
        !u.employmentStatus.toLowerCase().includes(inlineFilters.employmentStatus.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineFilters.joinDate &&
        !formatDateToDMY(u.joinDate).includes(inlineFilters.joinDate)
      ) {
        return false;
      }
      if (inlineFilters.resignDate) {
        const resignRecord = [...u.statusHistory].reverse().find((s) => s.status === 'Resigned');
        const resignDateStr =
          u.employmentStatus === 'Resigned' && resignRecord
            ? formatDateToDMY(resignRecord.actualDate || resignRecord.fromDate)
            : '';
        if (!resignDateStr.includes(inlineFilters.resignDate)) {
          return false;
        }
      }

      return true;
    });
  }, [users, appliedFilters, inlineFilters]);

  // Sorted Records
  const sortedUsers = useMemo(() => {
    if (!sortField) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'resignDate') {
        const rA = [...a.statusHistory].reverse().find((s) => s.status === 'Resigned');
        const rB = [...b.statusHistory].reverse().find((s) => s.status === 'Resigned');
        valA = a.employmentStatus === 'Resigned' && rA ? rA.actualDate || rA.fromDate : '';
        valB = b.employmentStatus === 'Resigned' && rB ? rB.actualDate || rB.fromDate : '';
      } else {
        valA = String(a[sortField] || '').toLowerCase();
        valB = String(b[sortField] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortOrder]);

  // Paginated records for current view
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  // Actions
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormModalOpen(true);
  };

  const handleSaveUser = (savedUser: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === savedUser.id);
      if (exists) {
        return prev.map((u) => (u.id === savedUser.id ? savedUser : u));
      }
      return [savedUser, ...prev];
    });
  };

  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const handleResetPasswordClick = (user: User) => {
    setUserToReset(user);
    setResetModalOpen(true);
  };

  const handleConfirmResetPassword = () => {
    if (userToReset) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userToReset.id ? { ...u, password: '123456' } : u))
      );
      setUserToReset(null);
      setResetModalOpen(false);
    }
  };

  const handleImportUsers = (newUsers: User[]) => {
    setUsers((prev) => [...newUsers, ...prev]);
  };

  return (
    <div>
      {/* Section 1: Collapsible Search & Action Card */}
      <UserFilterCard
        filterParams={filterParams}
        supervisors={supervisors}
        onFilterChange={setFilterParams}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        onExportCsv={() => exportUsersToCsv(filteredUsers)}
        onDownloadTemplate={downloadTemplateCsv}
        onOpenImei={() => setImeiModalOpen(true)}
        onOpenAddModal={handleOpenAdd}
        onOpenImportModal={() => setImportModalOpen(true)}
      />

      {/* Section 2: Pagination & User Data Table Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* 4.1 Top Pagination Controls */}
        <UserPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalEntries={sortedUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />

        {/* 4.2 & 4.3 Data Table */}
        <UserTable
          users={paginatedUsers}
          currentPage={currentPage}
          pageSize={pageSize}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          inlineFilters={inlineFilters}
          onInlineFilterChange={handleInlineFilterChange}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUserClick}
          onResetPassword={handleResetPasswordClick}
        />
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={formModalOpen}
        user={editingUser}
        supervisors={supervisors}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveUser}
      />

      <UserImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportUsers={handleImportUsers}
      />

      <UserImeiModal
        isOpen={imeiModalOpen}
        users={users}
        onClose={() => setImeiModalOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title={t('user.confirm_delete', 'Confirm Delete User')}
        message={`${t('user.delete_confirm_msg', 'Are you sure you want to delete user')} ${userToDelete?.fullName} (${userToDelete?.employeeCode})?`}
        confirmLabel={t('action.delete', 'Delete')}
        confirmColor="primary"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
      />

      <ConfirmModal
        isOpen={resetModalOpen}
        title={t('user.confirm_reset', 'Confirm Password Reset')}
        message={`${t('user.reset_confirm_msg', 'Reset password for user')} "${userToReset?.username}" (${userToReset?.fullName}) to default (123456)?`}
        confirmLabel={t('user.confirm_reset_btn', 'Reset Password')}
        confirmColor="success"
        onConfirm={handleConfirmResetPassword}
        onCancel={() => {
          setResetModalOpen(false);
          setUserToReset(null);
        }}
      />
    </div>
  );
};

export default UserListPage;
