import { useEffect, useRef, useState } from 'react';

/* ---------- fetch-once hook ---------- */
export function usePasswordPolicy() {
  const [policy, setPolicy] = useState(null);
  const fetched = useRef(false);                 // guards React 18 double-fetch

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch('/api/passwords/policy')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(json => setPolicy(json.policy))
      .catch(console.error);
  }, []);

  return policy;                                 // null → still loading
}

/* ---------- client-side validator ---------- */
export function validatePassword(pwd, policy) {
  if (!policy) return { ok: false, errors: { loading: true } };

  const errors = {};
  if (pwd.length < policy.minLength)                        errors.minLength = true;
  if (policy.requireUppercase   && !/[A-Z]/.test(pwd))      errors.uppercase = true;
  if (policy.requireLowercase   && !/[a-z]/.test(pwd))      errors.lowercase = true;
  if (policy.requireNumbers     && !/\d/.test(pwd))         errors.number    = true;
  if (policy.requireSpecialChars&& !/[^A-Za-z0-9]/.test(pwd)) errors.special = true;
  if (policy.dictionaryBlocklist?.some(w =>
        pwd.toLowerCase().includes(w.toLowerCase())))
                                                             errors.blocklist = true;
  console.log('Password validation:', { pwd, errors });
  return { ok: Object.keys(errors).length === 0, errors };
}

/* ---------- live hint list ---------- */
export function PasswordCriteria({ pwd, policy }) {
  if (!policy) return null;

  const { errors } = validatePassword(pwd, policy);

  const Item = ({ flag, label }) => (
    <span style={{
      display:'flex',alignItems:'center',gap:4,
      color: flag ? 'green' : 'gray'
    }}>
      {flag ? '✓' : '✗'} {label}
    </span>
  );

  return (
    <div style={{paddingLeft:8}}>
      <Item flag={!errors.minLength}  label={`≥ ${policy.minLength} chars`} />
      {policy.requireUppercase    && <Item flag={!errors.uppercase}  label="upper-case" />}
      {policy.requireLowercase    && <Item flag={!errors.lowercase}  label="lower-case" />}
      {policy.requireNumbers      && <Item flag={!errors.number}     label="number"     />}
      {policy.requireSpecialChars && <Item flag={!errors.special}    label="special"    />}
      {policy.dictionaryBlocklist?.length > 0 &&
                                   <Item flag={!errors.blocklist}   label="not common" />}
    </div>
  );
}
