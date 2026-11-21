import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Camera } from 'lucide-react';
import {
  User,
  Gender,
  MaritalStatus,
  Region,
  IdentityDocType,
  AccountStatus,
  EmploymentStatus,
  UserPosition,
  UserPositionHistory,
  UserSupervisorHistory,
  UserStatusHistory,
} from '@/types/user';
import { formatDateToDMY } from '@/utils/date';
import { useI18n } from '@/context/I18nContext';

interface UserFormModalProps {
  isOpen: boolean;
  user: User | null; // null for Create mode, existing user for Edit mode
  supervisors: User[];
  onClose: () => void;
  onSave: (user: User) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  user,
  supervisors,
  onClose,
  onSave,
}) => {
  const { t } = useI18n();
  // Form State
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('Single');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [region, setRegion] = useState<Region>('North');
  const [workProvince, setWorkProvince] = useState('');
  const [newWorkProvince, setNewWorkProvince] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [temporaryAddress, setTemporaryAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Work & Assignment
  const [employeeCode, setEmployeeCode] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [positionHistory, setPositionHistory] = useState<UserPositionHistory[]>([]);
  const [newPos, setNewPos] = useState<UserPosition>('PG-Inline');
  const [newPosFromDate, setNewPosFromDate] = useState('');
  const [newPosToDate, setNewPosToDate] = useState('');

  const [supervisorHistory, setSupervisorHistory] = useState<UserSupervisorHistory[]>([]);
  const [newSupId, setNewSupId] = useState('');
  const [newSupFromDate, setNewSupFromDate] = useState('');
  const [newSupToDate, setNewSupToDate] = useState('');

  // Identity
  const [identityDocType, setIdentityDocType] = useState<IdentityDocType>('CCCD');
  const [identityNumber, setIdentityNumber] = useState('');
  const [identityIssueDate, setIdentityIssueDate] = useState('');
  const [identityIssuePlace, setIdentityIssuePlace] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');

  // Account
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('Active');

  // Employment Status & History
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Official');
  const [statusHistory, setStatusHistory] = useState<UserStatusHistory[]>([]);
  const [newStatus, setNewStatus] = useState<EmploymentStatus>('Official');
  const [newStatusFromDate, setNewStatusFromDate] = useState('');
  const [newStatusToDate, setNewStatusToDate] = useState('');
  const [newStatusReason, setNewStatusReason] = useState('');
  const [newStatusNote, setNewStatusNote] = useState('');

  // Validation Error
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (user) {
      setLastName(user.lastName);
      setFirstName(user.firstName);
      setGender(user.gender || 'Male');
      setDateOfBirth(user.dateOfBirth || '');
      setMaritalStatus(user.maritalStatus || 'Single');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber);
      setRegion(user.region);
      setWorkProvince(user.workProvince);
      setNewWorkProvince(user.newWorkProvince || '');
      setPermanentAddress(user.permanentAddress || '');
      setTemporaryAddress(user.temporaryAddress || '');
      setAvatarUrl(user.avatarUrl || '');

      setEmployeeCode(user.employeeCode);
      setJoinDate(user.joinDate);
      setPositionHistory([...user.positionHistory]);
      setSupervisorHistory([...user.supervisorHistory]);

      setIdentityDocType(user.identityDocType);
      setIdentityNumber(user.identityNumber);
      setIdentityIssueDate(user.identityIssueDate || '');
      setIdentityIssuePlace(user.identityIssuePlace || '');
      setFrontImageUrl(user.identityFrontImageUrl || '');
      setBackImageUrl(user.identityBackImageUrl || '');

      setUsername(user.username);
      setPassword(user.password);
      setConfirmPassword(user.password);
      setAccountStatus(user.accountStatus);

      setEmploymentStatus(user.employmentStatus);
      setStatusHistory([...user.statusHistory]);
    } else {
      // Defaults for Create mode
      const today = new Date().toISOString().split('T')[0];
      setLastName('');
      setFirstName('');
      setGender('Male');
      setDateOfBirth('');
      setMaritalStatus('Single');
      setEmail('');
      setPhoneNumber('');
      setRegion('North');
      setWorkProvince('');
      setNewWorkProvince('');
      setPermanentAddress('');
      setTemporaryAddress('');
      setAvatarUrl('');

      setEmployeeCode(`FD${Math.floor(100 + Math.random() * 900)}`);
      setJoinDate(today);
      setPositionHistory([
        {
          id: `ph-new-${Date.now()}`,
          position: 'PG-Inline',
          fromDate: today,
        },
      ]);
      setSupervisorHistory([]);

      setIdentityDocType('CCCD');
      setIdentityNumber('');
      setIdentityIssueDate('');
      setIdentityIssuePlace('Police Dept of Administrative Management');
      setFrontImageUrl('');
      setBackImageUrl('');

      setUsername('');
      setPassword('123456');
      setConfirmPassword('123456');
      setAccountStatus('Active');

      setEmploymentStatus('Official');
      setStatusHistory([
        {
          id: `sh-new-${Date.now()}`,
          status: 'Official',
          fromDate: today,
        },
      ]);
    }
    setValidationError('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Add Position History
  const handleAddPosition = () => {
    if (!newPosFromDate) return;
    const item: UserPositionHistory = {
      id: `ph-${Date.now()}`,
      position: newPos,
      fromDate: newPosFromDate,
      toDate: newPosToDate || undefined,
    };
    setPositionHistory([...positionHistory, item]);
    setNewPosFromDate('');
    setNewPosToDate('');
  };

  const handleRemovePosition = (id: string) => {
    setPositionHistory(positionHistory.filter((p) => p.id !== id));
  };

  // Add Supervisor History
  const handleAddSupervisor = () => {
    if (!newSupId || !newSupFromDate) return;
    const sup = supervisors.find((s) => s.id === newSupId);
    if (!sup) return;

    const item: UserSupervisorHistory = {
      id: `svh-${Date.now()}`,
      supervisorId: sup.id,
      supervisorName: sup.fullName,
      fromDate: newSupFromDate,
      toDate: newSupToDate || undefined,
    };
    setSupervisorHistory([...supervisorHistory, item]);
    setNewSupFromDate('');
    setNewSupToDate('');
    setNewSupId('');
  };

  const handleRemoveSupervisor = (id: string) => {
    setSupervisorHistory(supervisorHistory.filter((s) => s.id !== id));
  };

  // Add Status History
  const handleAddStatus = () => {
    if (!newStatusFromDate) return;
    const item: UserStatusHistory = {
      id: `sh-${Date.now()}`,
      status: newStatus,
      fromDate: newStatusFromDate,
      toDate: newStatusToDate || undefined,
      actualDate: newStatus === 'Resigned' ? newStatusFromDate : undefined,
      reason: newStatusReason || undefined,
      note: newStatusNote || undefined,
    };
    setStatusHistory([...statusHistory, item]);
    setEmploymentStatus(newStatus);
    setNewStatusFromDate('');
    setNewStatusToDate('');
    setNewStatusReason('');
    setNewStatusNote('');
  };

  const handleRemoveStatus = (id: string) => {
    setStatusHistory(statusHistory.filter((s) => s.id !== id));
  };

  // Handle Form Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Required fields per SPEC-05 Section 5
    if (!employeeCode.trim()) {
      setValidationError('Employee Code is required.');
      return;
    }
    if (!lastName.trim() || !firstName.trim()) {
      setValidationError('Last Name and First Name are required.');
      return;
    }
    if (!phoneNumber.trim()) {
      setValidationError('Phone Number is required.');
      return;
    }
    if (!username.trim()) {
      setValidationError('Username is required.');
      return;
    }
    if (!identityNumber.trim()) {
      setValidationError('Identity Number (CMND / CCCD) is required.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Password and Confirm Password do not match.');
      return;
    }

    // Determine current active assignments
    const latestPos = positionHistory.length > 0 ? positionHistory[positionHistory.length - 1].position : 'PG-Inline';
    const latestSup = supervisorHistory.length > 0 ? supervisorHistory[supervisorHistory.length - 1] : undefined;

    const formattedFullName = `${lastName.trim()} ${firstName.trim()}`;

    const savedUser: User = {
      id: user ? user.id : `usr-${Date.now()}`,
      employeeCode: employeeCode.trim(),
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      fullName: formattedFullName,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      maritalStatus,
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim(),
      region,
      workProvince: workProvince.trim() || 'Ha Noi',
      newWorkProvince: newWorkProvince.trim() || undefined,
      permanentAddress: permanentAddress.trim() || undefined,
      temporaryAddress: temporaryAddress.trim() || undefined,
      avatarUrl: avatarUrl || undefined,

      currentPosition: latestPos,
      currentSupervisorId: latestSup ? latestSup.supervisorId : undefined,
      currentSupervisorName: latestSup ? latestSup.supervisorName : undefined,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      positionHistory,
      supervisorHistory,

      identityDocType,
      identityNumber: identityNumber.trim(),
      identityIssueDate: identityIssueDate || undefined,
      identityIssuePlace: identityIssuePlace.trim() || undefined,
      identityFrontImageUrl: frontImageUrl || undefined,
      identityBackImageUrl: backImageUrl || undefined,

      username: username.trim(),
      password,
      accountStatus,

      employmentStatus,
      statusHistory,
    };

    onSave(savedUser);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
            {user ? `${t('user.edit_user', 'Edit User')}: ${user.fullName} (${user.employeeCode})` : t('user.create_user', 'Create New User')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: 5 Sections */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {validationError && (
              <div
                style={{
                  backgroundColor: 'var(--color-primary-soft-bg)',
                  color: 'var(--color-primary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  border: '1px solid var(--color-primary)',
                }}
              >
                {validationError}
              </div>
            )}

            {/* Section 1: Personal Information */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                1. {t('user.personal_info', 'Personal Information')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.last_name', 'Last Name')} *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.first_name', 'First Name')} *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.full_name', 'Full Name')} (Auto-Synced)</label>
                  <input
                    type="text"
                    disabled
                    value={`${lastName} ${firstName}`.trim()}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.gender', 'Gender')}</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="Male">{t('user.gender_male', 'Male')}</option>
                    <option value="Female">{t('user.gender_female', 'Female')}</option>
                    <option value="Other">{t('user.gender_other', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.dob', 'Date of Birth')}</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.marital_status', 'Marital Status')}</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="Single">{t('user.single', 'Single')}</option>
                    <option value="Married">{t('user.married', 'Married')}</option>
                    <option value="Divorced">{t('user.divorced', 'Divorced')}</option>
                    <option value="Widowed">{t('user.widowed', 'Widowed')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.phone', 'Phone Number')} *</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.email', 'Email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.region', 'Region')}</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as Region)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="North">{t('field.region_north', 'North')}</option>
                    <option value="Central">{t('field.region_central', 'Central')}</option>
                    <option value="South">{t('field.region_south', 'South')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.province', 'Province/City')}</label>
                  <input
                    type="text"
                    value={workProvince}
                    onChange={(e) => setWorkProvince(e.target.value)}
                    placeholder="e.g. Ha Noi, Da Nang"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.province_new', 'Province/City (New)')}</label>
                  <input
                    type="text"
                    value={newWorkProvince}
                    onChange={(e) => setNewWorkProvince(e.target.value)}
                    placeholder="Optional new province"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.permanent_address', 'Permanent Address')}</label>
                  <input
                    type="text"
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="Enter permanent address"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.temporary_address', 'Temporary Address')}</label>
                  <input
                    type="text"
                    value={temporaryAddress}
                    onChange={(e) => setTemporaryAddress(e.target.value)}
                    placeholder="Enter temporary address"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Work & Assignment Information */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                2. {t('user.work_info', 'Work & Assignment Information')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.employee_code', 'Employee Code')} *</label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="e.g. FD001"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.join_date', 'Join Date')} *</label>
                  <input
                    type="date"
                    required
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              {/* Position Assignment Sub-table */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{t('user.position_history', 'Position History')}</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <select
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value as UserPosition)}
                    style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="PG-Inline">PG-Inline</option>
                    <option value="Customer">Customer</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <input
                    type="date"
                    value={newPosFromDate}
                    onChange={(e) => setNewPosFromDate(e.target.value)}
                    title="From Date"
                    style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <input
                    type="date"
                    value={newPosToDate}
                    onChange={(e) => setNewPosToDate(e.target.value)}
                    title="To Date"
                    style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPosition}
                    style={{
                      height: '30px',
                      padding: '0 12px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} /> {t('user.add_position', 'Add Position')}
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                  <thead style={{ backgroundColor: 'var(--bg-canvas)' }}>
                    <tr>
                      <th style={{ padding: '6px 8px', textAlign: 'left', width: '40px' }}>{t('table.no', 'No.')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.position', 'Position')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.from_date', 'From Date')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.to_date', 'To Date')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', width: '60px' }}>{t('action.actions', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positionHistory.map((ph, idx) => (
                      <tr key={ph.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 8px' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{ph.position}</td>
                        <td style={{ padding: '6px 8px' }}>{formatDateToDMY(ph.fromDate)}</td>
                        <td style={{ padding: '6px 8px' }}>{ph.toDate ? formatDateToDMY(ph.toDate) : t('user.ongoing', 'Ongoing')}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemovePosition(ph.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Supervisor Assignment Sub-table */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{t('user.supervisor_history', 'Supervisor Assignment History')}</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <select
                    value={newSupId}
                    onChange={(e) => setNewSupId(e.target.value)}
                    style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="">{t('field.select_supervisor', 'Select Supervisor')}</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.employeeCode})
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newSupFromDate}
                    onChange={(e) => setNewSupFromDate(e.target.value)}
                    title="From Date"
                    style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <input
                    type="date"
                    value={newSupToDate}
                    onChange={(e) => setNewSupToDate(e.target.value)}
                    title="To Date"
                    style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSupervisor}
                    style={{
                      height: '30px',
                      padding: '0 12px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} /> {t('user.assign_supervisor', 'Assign Supervisor')}
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                  <thead style={{ backgroundColor: 'var(--bg-canvas)' }}>
                    <tr>
                      <th style={{ padding: '6px 8px', textAlign: 'left', width: '40px' }}>{t('table.no', 'No.')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.supervisor', 'Supervisor')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.from_date', 'From Date')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.to_date', 'To Date')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', width: '60px' }}>{t('action.actions', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisorHistory.map((sh, idx) => (
                      <tr key={sh.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 8px' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{sh.supervisorName}</td>
                        <td style={{ padding: '6px 8px' }}>{formatDateToDMY(sh.fromDate)}</td>
                        <td style={{ padding: '6px 8px' }}>{sh.toDate ? formatDateToDMY(sh.toDate) : t('user.ongoing', 'Ongoing')}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveSupervisor(sh.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Identity Document Information */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                3. {t('user.id_info', 'Identity Document Information')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.doc_type', 'Doc Type')}</label>
                  <select
                    value={identityDocType}
                    onChange={(e) => setIdentityDocType(e.target.value as IdentityDocType)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="CCCD">CCCD</option>
                    <option value="CMND">CMND</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.identity_number', 'ID Number')} *</label>
                  <input
                    type="text"
                    required
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    placeholder="Enter ID / CCCD number"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.issue_date', 'Issue Date')}</label>
                  <input
                    type="date"
                    value={identityIssueDate}
                    onChange={(e) => setIdentityIssueDate(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.issue_place', 'Issue Place')}</label>
                  <input
                    type="text"
                    value={identityIssuePlace}
                    onChange={(e) => setIdentityIssuePlace(e.target.value)}
                    placeholder="e.g. Police Dept of Admin Management"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              {/* ID Photo Preview Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center', backgroundColor: 'var(--bg-canvas)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>{t('user.front_id_photo', 'Front ID Photo')}</div>
                  <Camera size={24} style={{ color: 'var(--text-secondary)', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('user.upload_front_preview', 'Click to upload front photo preview')}</div>
                </div>
                <div style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center', backgroundColor: 'var(--bg-canvas)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>{t('user.back_id_photo', 'Back ID Photo')}</div>
                  <Camera size={24} style={{ color: 'var(--text-secondary)', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('user.upload_back_preview', 'Click to upload back photo preview')}</div>
                </div>
              </div>
            </div>

            {/* Section 4: Account Information */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                4. {t('user.account_info', 'Account Information')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('login.username', 'Username')} *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('login.password', 'Password')} *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('user.confirm_password', 'Confirm Password')} *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{t('field.account_status', 'Account Status')}</label>
                  <select
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value as AccountStatus)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="Active">{t('user.status_active', 'Active')}</option>
                    <option value="Inactive">{t('user.status_inactive', 'Inactive')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Employment Status & History */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                5. {t('user.employment_history', 'Employment Status & History')}
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
                  style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="Official">{t('user.status_official', 'Official')}</option>
                  <option value="Probation">{t('user.status_probation', 'Probation')}</option>
                  <option value="Resigned">{t('user.status_resigned', 'Resigned')}</option>
                </select>
                <input
                  type="date"
                  value={newStatusFromDate}
                  onChange={(e) => setNewStatusFromDate(e.target.value)}
                  title="From Date / Effective Date"
                  style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
                <input
                  type="date"
                  value={newStatusToDate}
                  onChange={(e) => setNewStatusToDate(e.target.value)}
                  title="To Date"
                  style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
                <input
                  type="text"
                  placeholder={t('user.status_reason_placeholder', 'Reason (if Resigned)')}
                  value={newStatusReason}
                  onChange={(e) => setNewStatusReason(e.target.value)}
                  style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}
                />
                <input
                  type="text"
                  placeholder={t('field.note', 'Note')}
                  value={newStatusNote}
                  onChange={(e) => setNewStatusNote(e.target.value)}
                  style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}
                />
                <button
                  type="button"
                  onClick={handleAddStatus}
                  style={{
                    height: '30px',
                    padding: '0 12px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={14} /> {t('user.add_status_entry', 'Add Status Entry')}
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                <thead style={{ backgroundColor: 'var(--bg-canvas)' }}>
                  <tr>
                    <th style={{ padding: '6px 8px', textAlign: 'left', width: '40px' }}>{t('table.no', 'No.')}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.status', 'Status')}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.from_date', 'From Date')}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.to_date', 'To Date')}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('user.reason', 'Reason')}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.note', 'Note')}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '60px' }}>{t('action.actions', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {statusHistory.map((sh, idx) => (
                    <tr key={sh.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '6px 8px' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 600 }}>{sh.status}</td>
                      <td style={{ padding: '6px 8px' }}>{formatDateToDMY(sh.fromDate)}</td>
                      <td style={{ padding: '6px 8px' }}>{sh.toDate ? formatDateToDMY(sh.toDate) : t('user.ongoing', 'Ongoing')}</td>
                      <td style={{ padding: '6px 8px' }}>{sh.reason || '-'}</td>
                      <td style={{ padding: '6px 8px' }}>{sh.note || '-'}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveStatus(sh.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              backgroundColor: 'var(--bg-canvas)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 20px',
                fontSize: '13px',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {t('action.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 24px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--color-success-accent)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {t('action.save', 'Save User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
