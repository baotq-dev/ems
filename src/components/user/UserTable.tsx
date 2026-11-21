import React from 'react';
import { ArrowUpDown, Pencil, Trash2, RotateCw } from 'lucide-react';
import { User } from '@/types/user';
import { formatDateToDMY } from '@/utils/date';
import { useI18n } from '@/context/I18nContext';

export type SortField =
  | 'region'
  | 'workProvince'
  | 'newWorkProvince'
  | 'employeeCode'
  | 'currentSupervisorName'
  | 'fullName'
  | 'identityNumber'
  | 'currentPosition'
  | 'username'
  | 'employmentStatus'
  | 'joinDate'
  | 'resignDate';

export interface InlineFilters {
  region: string;
  workProvince: string;
  newWorkProvince: string;
  employeeCode: string;
  currentSupervisorName: string;
  fullName: string;
  identityNumber: string;
  currentPosition: string;
  username: string;
  employmentStatus: string;
  joinDate: string;
  resignDate: string;
}

interface UserTableProps {
  users: User[];
  currentPage: number;
  pageSize: number;
  sortField: SortField | null;
  sortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  inlineFilters: InlineFilters;
  onInlineFilterChange: (field: keyof InlineFilters, value: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentPage,
  pageSize,
  sortField,
  sortOrder,
  onSort,
  inlineFilters,
  onInlineFilterChange,
  onEditUser,
  onDeleteUser,
  onResetPassword,
}) => {
  const { t } = useI18n();

  const getResignDateStr = (user: User): string => {
    if (user.employmentStatus !== 'Resigned') return '';
    const resignRecord = [...user.statusHistory].reverse().find((s) => s.status === 'Resigned');
    return resignRecord ? formatDateToDMY(resignRecord.actualDate || resignRecord.fromDate) : '';
  };

  const renderSortHeader = (label: string, field: SortField) => {
    const isSorted = sortField === field;
    return (
      <th
        onClick={() => onSort(field)}
        style={{
          padding: '10px 8px',
          color: 'var(--color-primary)',
          fontWeight: 700,
          fontSize: '13px',
          textAlign: 'center',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          borderRight: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>{label}</span>
          <ArrowUpDown
            size={13}
            style={{
              opacity: isSorted ? 1 : 0.4,
              color: isSorted ? 'var(--color-primary)' : 'inherit',
              transform: isSorted && sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        </div>
      </th>
    );
  };

  const renderInlineInput = (field: keyof InlineFilters) => {
    return (
      <th style={{ padding: '4px 6px', borderRight: '1px solid var(--border-color)' }}>
        <input
          type="text"
          value={inlineFilters[field]}
          onChange={(e) => onInlineFilterChange(field, e.target.value)}
          placeholder="Filter..."
          style={{
            width: '100%',
            height: '26px',
            padding: '0 6px',
            fontSize: '12px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </th>
    );
  };

  return (
    <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-surface)' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          textAlign: 'center',
          borderTop: 'none',
        }}
      >
        <thead>
          {/* Header Row 1: Titles */}
          <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
            <th
              style={{
                padding: '10px 8px',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '13px',
                textAlign: 'center',
                width: '45px',
                borderRight: '1px solid var(--border-color)',
              }}
            >
              {t('table.no', 'No.')}
            </th>
            {renderSortHeader(t('field.region', 'Region'), 'region')}
            {renderSortHeader(t('field.province', 'Province/City'), 'workProvince')}
            {renderSortHeader(t('field.province_new', 'Province/City (New)'), 'newWorkProvince')}
            {renderSortHeader(t('field.employee_code', 'Employee Code'), 'employeeCode')}
            {renderSortHeader(t('field.supervisor', 'Supervisor'), 'currentSupervisorName')}
            {renderSortHeader(t('field.full_name', 'Full Name'), 'fullName')}
            {renderSortHeader(t('field.identity_number', 'ID / CCCD'), 'identityNumber')}
            {renderSortHeader(t('field.position', 'Position'), 'currentPosition')}
            {renderSortHeader(t('login.username', 'Username'), 'username')}
            {renderSortHeader(t('field.employment_status', 'Employment Status'), 'employmentStatus')}
            {renderSortHeader(t('field.join_date', 'Join Date'), 'joinDate')}
            {renderSortHeader(t('field.resign_date', 'Resign Date'), 'resignDate')}
            <th
              style={{
                padding: '10px 8px',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '13px',
                textAlign: 'center',
                width: '110px',
              }}
            >
              {t('action.actions', 'Actions')}
            </th>
          </tr>

          {/* Header Row 2: Inline Quick-Filters */}
          <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '4px 6px', borderRight: '1px solid var(--border-color)' }} />
            {renderInlineInput('region')}
            {renderInlineInput('workProvince')}
            {renderInlineInput('newWorkProvince')}
            {renderInlineInput('employeeCode')}
            {renderInlineInput('currentSupervisorName')}
            {renderInlineInput('fullName')}
            {renderInlineInput('identityNumber')}
            {renderInlineInput('currentPosition')}
            {renderInlineInput('username')}
            {renderInlineInput('employmentStatus')}
            {renderInlineInput('joinDate')}
            {renderInlineInput('resignDate')}
            <th style={{ padding: '4px 6px' }} />
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={14}
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                }}
              >
                {t('table.no_results', 'No user records found matching the filter criteria.')}
              </td>
            </tr>
          ) : (
            users.map((user, index) => {
              const rowIndex = (currentPage - 1) * pageSize + index + 1;
              const resignDateDisplay = getResignDateStr(user);

              return (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* 1. No. */}
                  <td style={{ padding: '8px', color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)' }}>
                    {rowIndex}
                  </td>

                  {/* 2. Region */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    {user.region}
                  </td>

                  {/* 3. Province/City */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    {user.workProvince}
                  </td>

                  {/* 4. Province/City (New) */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    {user.newWorkProvince || '-'}
                  </td>

                  {/* 5. Employee Code */}
                  <td
                    style={{
                      padding: '8px',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      borderRight: '1px solid var(--border-color)',
                    }}
                  >
                    {user.employeeCode}
                  </td>

                  {/* 6. Supervisor */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    {user.currentSupervisorName || '-'}
                  </td>

                  {/* 7. Full Name */}
                  <td
                    style={{
                      padding: '8px',
                      fontWeight: 500,
                      textAlign: 'left',
                      borderRight: '1px solid var(--border-color)',
                    }}
                  >
                    {user.fullName}
                  </td>

                  {/* 8. ID / CCCD */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    {user.identityNumber}
                  </td>

                  {/* 9. Position */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-canvas)',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      {user.currentPosition}
                    </span>
                  </td>

                  {/* 10. Username */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    {user.username}
                  </td>

                  {/* 11. Employment Status */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor:
                          user.employmentStatus === 'Official'
                            ? '#E8F5E9'
                            : user.employmentStatus === 'Probation'
                            ? '#FFF8E1'
                            : '#F5F5F5',
                        color:
                          user.employmentStatus === 'Official'
                            ? 'var(--color-success-accent)'
                            : user.employmentStatus === 'Probation'
                            ? '#F57F17'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {user.employmentStatus}
                    </span>
                  </td>

                  {/* 12. Join Date */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    {formatDateToDMY(user.joinDate)}
                  </td>

                  {/* 13. Resign Date */}
                  <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)' }}>
                    {resignDateDisplay || '-'}
                  </td>

                  {/* 14. Actions */}
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        title={t('action.edit', 'Edit User')}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        title={t('action.delete', 'Delete User')}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#D32F2F',
                          color: '#FFFFFF',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Reset Password Button */}
                      <button
                        type="button"
                        onClick={() => onResetPassword(user)}
                        title={t('action.reset', 'Reset Password to default (123456)')}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-success-accent)',
                          color: '#FFFFFF',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <RotateCw size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
export default UserTable;
