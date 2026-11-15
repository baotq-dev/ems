import { User } from '@/types/user';
import { formatDateToDMY } from './date';

export function exportUsersToCsv(users: User[], filename = 'users_export.csv'): void {
  const headers = [
    'No.',
    'Region',
    'Province/City',
    'Province/City (New)',
    'Employee Code',
    'Supervisor',
    'Full Name',
    'ID / CCCD',
    'Position',
    'Username',
    'Employment Status',
    'Join Date',
    'Resign Date',
  ];

  const rows = users.map((user, idx) => {
    const resignRecord = [...user.statusHistory]
      .reverse()
      .find((s) => s.status === 'Resigned');
    const resignDate =
      user.employmentStatus === 'Resigned' && resignRecord
        ? formatDateToDMY(resignRecord.actualDate || resignRecord.fromDate)
        : '';

    return [
      idx + 1,
      `"${user.region || ''}"`,
      `"${user.workProvince || ''}"`,
      `"${user.newWorkProvince || ''}"`,
      `"${user.employeeCode || ''}"`,
      `"${user.currentSupervisorName || ''}"`,
      `"${user.fullName || ''}"`,
      `"${user.identityNumber || ''}"`,
      `"${user.currentPosition || ''}"`,
      `"${user.username || ''}"`,
      `"${user.employmentStatus || ''}"`,
      `"${formatDateToDMY(user.joinDate)}"`,
      `"${resignDate}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTemplateCsv(): void {
  const headers = [
    'Employee Code',
    'Last Name',
    'First Name',
    'Username',
    'Phone Number',
    'Region',
    'Province/City',
    'Province/City (New)',
    'Position',
    'Supervisor ID',
    'ID / CCCD',
    'Employment Status',
    'Join Date (YYYY-MM-DD)',
  ];

  const sampleRow = [
    'FD099',
    'Nguyen Van',
    'A',
    'anguyen',
    '0909999999',
    'South',
    'Ho Chi Minh City',
    '',
    'PG-Inline',
    'usr-002',
    '079099000099',
    'Official',
    '2023-01-01',
  ];

  const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'user_import_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
