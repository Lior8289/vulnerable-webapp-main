// CustomerFormModal.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

/* ------------------------------------------------------------------
 *  ✨ קומפוננטה פנימית שמזריקה HTML ומריצה סקריפטים
 * ------------------------------------------------------------------ */
function ExecutableHtml({ html }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.querySelectorAll("script").forEach((oldScript) => {
      const s = document.createElement("script");
      s.text = oldScript.textContent;
      [...oldScript.attributes].forEach((a) => s.setAttribute(a.name, a.value));
      oldScript.parentNode.replaceChild(s, oldScript);
    });
  }, [html]);

  return (
    <Box
      ref={ref}
      dangerouslySetInnerHTML={{ __html: html }}
      sx={{
        mt: 2,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        overflowX: "auto",
        minHeight: 60,
      }}
    />
  );
}

/* ------------------------------------------------------------------
 *   CustomerFormModal – הוספה / עריכה של לקוח
 * ------------------------------------------------------------------ */
export default function CustomerFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    date: "",
  });
  const [invalidFields, setInvalid] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    email: false,
    date: false,
  });
  const [previewHtml, setPreviewHtml] = useState(""); // כאן נשמור את ה-HTML שירוץ
  const todayISO = new Date().toISOString().split("T")[0];

  /* -------- הוספת לקוח לשרת (כפי שהיה בקוד שלך) -------- */
  const addCustomer = async (customerDetails) => {
    try {
      const response = await fetch("/api/customers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerDetails),
      });
      if (!response.ok) throw new Error("Failed to add customer");
      await response.json();
    } catch (err) {
      console.error(err);
    }
  };

  /* -------- הטענת נתונים ראשוניים / איפוס -------- */
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        date: "",
      });
    }
  }, [initialData, open]);

  /* -------- שליחת הטופס -------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setInvalid({
      first_name: false,
      last_name: false,
      phone: false,
      email: false,
      date: false,
    });

    const empties = {
      first_name: !formData.first_name.trim(),
      last_name: !formData.last_name.trim(),
      phone: !formData.phone.trim(),
      email: !formData.email.trim(),
      date: !formData.date,
    };

    const namePattern = /^[A-Za-z\u0590-\u05FF\s'-]{2,50}$/;
    const phonePattern = /^\+?[0-9]{7,15}$/;

    const formats = {
      first_name: !empties.first_name && !namePattern.test(formData.first_name),
      last_name: !empties.last_name && !namePattern.test(formData.last_name),
      phone: !empties.phone && !phonePattern.test(formData.phone),
    };

    const newInvalid = {
      first_name: empties.first_name || formats.first_name,
      last_name: empties.last_name || formats.last_name,
      phone: empties.phone || formats.phone,
      email: empties.email,
      date: empties.date,
    };
    setInvalid(newInvalid);

    if (Object.values(newInvalid).some(Boolean)) return;

    const id = initialData ? initialData.id : uuidv4();
    const formattedDate = dayjs(formData.date).format("YYYY-MM-DD");

    const customerDetails = {
      id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      email: formData.email,
      birthday: formattedDate,
    };

    onSubmit(customerDetails, Boolean(initialData));
    if (!initialData) await addCustomer(customerDetails);
  };

  /* -------- סגירה ואיפוס -------- */
  const handleClose = () => {
    setFormData({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      date: "",
    });
    setPreviewHtml("");
    onClose();
  };

  /* ------------------------------------------------------------------
   *                          UI
   * ------------------------------------------------------------------ */
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          m: 2,
          maxWidth: { sm: 600 },
          bgcolor: "background.paper",
        },
      }}
    >
      {/* כותרת */}
      <DialogTitle
        sx={{
          pb: 2,
          pt: 3,
          px: 3,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "primary.main" }}
        >
          {initialData ? "Edit Customer" : "Add New Customer"}
        </Typography>
      </DialogTitle>

      {/* תוכן (טופס) */}
      <DialogContent sx={{ p: 0, overflowY: "auto" }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
          }}
        >
          <TextField
            label="First Name"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
            error={invalidFields.first_name}
            helperText={invalidFields.first_name && "First name is required"}
            required
            fullWidth
            sx={{ gridColumn: { xs: "1", sm: "1" } }}
          />
          <TextField
            label="Last Name"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
            error={invalidFields.last_name}
            helperText={invalidFields.last_name && "Last name is required"}
            required
            fullWidth
            sx={{ gridColumn: { xs: "1", sm: "2" } }}
          />
          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            error={invalidFields.phone}
            helperText={invalidFields.phone && "Phone number is required"}
            required
            fullWidth
            sx={{ gridColumn: { xs: "1", sm: "1" } }}
          />
          {/* ------- שדה Email עם onBlur שמזריק את הערך ל-previewHtml ------- */}
          <TextField
            label={
              <span
                dangerouslySetInnerHTML={{
                  __html: formData.email || "Email",
                }}
              />
            }
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            onBlur={(e) => setPreviewHtml(e.target.value)}
            required
            fullWidth
            sx={{ gridColumn: { xs: "1", sm: "2" } }}
          />
          <TextField
            label="Date of Birth"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={invalidFields.date}
            helperText={invalidFields.date && "Date is required"}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: todayISO }}
            sx={{ gridColumn: { xs: "1", sm: "1 / 3" } }}
          />
        </Box>
      </DialogContent>

      {/* תצוגת ה-HTML (כולל הרצת סקריפט) */}
      {previewHtml && <ExecutableHtml html={previewHtml} />}

      {/* כפתורי פעולה */}
      <DialogActions
        sx={{ p: 3, pt: 2, borderTop: 1, borderColor: "divider", gap: 1 }}
      >
        <Button onClick={handleClose} sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ textTransform: "none", px: 3 }}
        >
          {initialData ? "Save Changes" : "Add Customer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------- PropTypes ------- */
CustomerFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};
