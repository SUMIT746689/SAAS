import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';

import {
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  Card
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { FileUploadFieldWrapper, NewFileUploadFieldWrapper, PreviewImageCard, TextFieldWrapper } from '@/components/TextFields';
import Image from 'next/image';
import { getFile } from '@/utils/utilitY-functions';
import { DebounceInput, NewDebounceInput } from '@/components/DebounceInput';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { PageHeaderTitleWrapper } from './PageHeaderTitle';

function PageHeader({ editUser, setEditUser, reFetchData }) {
  const { user }: any = useAuth();
  const [user_photo, setUser_photo] = useState(null);
  const [isAvailableUsername, setIsAvailableUsername] = useState(null);
  console.log({ editUser });
  useEffect(() => {
    if (editUser) handleCreateUserOpen();
  }, [editUser]);

  const permissons = [{ label: 'Branch Admin', role: 'BRANCH_ADMIN', value: 'create_branch_admin' }];
  const available_permissions = user?.permissions?.map((permission) => permission.value);
  console.log({ available_permissions });
  const userPrermissionRoles = permissons.filter((role) => available_permissions?.includes(role.value));

  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();

  const handleCreateUserOpen = () => {
    setOpen(true);
  };

  const handleCreateUserClose = () => {
    setUser_photo(null);
    setOpen(false);
    setEditUser(null);
    setIsAvailableUsername(null);
  };

  const handleCreateUserSuccess = (mess) => {
    showNotification(mess);
    setOpen(false);
  };

  const handleFormSubmit = async (_values, formValue) => {
    const { resetForm, setErrors, setStatus, setSubmitting } = formValue;
    try {
      const handleResponseSuccess = (msg) => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateUserSuccess(msg);
        reFetchData(true);
      };

      const formData = new FormData();
      for (const i in _values) {
        if (i === 'role') {
          formData.append(`${i}`, JSON.stringify(_values[i]));
        } else {
          formData.append(`${i}`, _values[i]);
        }
      }

      if (editUser) {
        await axios.patch(`/api/user/${editUser.id}`, formData);
        handleResponseSuccess('The user account was edited successfully');
      } else {
        await axios.post(`/api/user`, formData);
        handleResponseSuccess('The user account was created successfully');
      }

      // await wait(1000);
    } catch (err) {
      handleShowErrMsg(err, showNotification);
      setStatus({ success: false });
      // @ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };
  console.log({ userPrermissionRoles });
  const temp = userPrermissionRoles.find((i) => i.role == editUser?.user_role?.title);
  console.log({ temp });

  const handleDebounce = (value) => {
    if (editUser?.username?.toLowerCase() === value?.toLowerCase()) return setIsAvailableUsername(null);
    if (value) {
      axios
        .get(`/api/user/is_available?username=${value}`)
        .then((res) => {
          setIsAvailableUsername(null);
        })
        .catch((err) => {
          setIsAvailableUsername(err?.response?.data?.message);
        });
    }
  };

  const handleFileChange = (e, setFieldValue, field, preview_field) => {
    if (e?.target?.files?.length === 0) {
      setFieldValue(field, '');
      setFieldValue(preview_field, []);
      return;
    }

    setFieldValue(field, e.target.files[0]);

    const imgPrev = [];
    Array.prototype.forEach.call(e.target.files, (file) => {
      const objectUrl = URL.createObjectURL(file);
      imgPrev.push({ name: file.name, src: objectUrl });
    });
    setFieldValue(preview_field, imgPrev);
  };

  const handleRemove = (setFieldValue, field, preview_field) => {
    setFieldValue(field, '');
    setFieldValue(preview_field, []);
  };

  return (
    <>
      <PageHeaderTitleWrapper name={'Delete User'} handleCreateClassOpen={handleCreateUserOpen} />
    </>
  );
}

export default PageHeader;
