import fs from 'fs';

let content = fs.readFileSync('src/features/admin/AdminUsersView.tsx', 'utf8');
content = content.replace(
  /const filteredUsers = users\.filter\(\(u\) => \{/,
  "const filteredUsers = users.filter((u) => {\n    if (u.role === 'customer') return false;"
);
content = content.replace(
  /\s*<option value="customer">CUSTOMER<\/option>/,
  ""
);
fs.writeFileSync('src/features/admin/AdminUsersView.tsx', content, 'utf8');
console.log('AdminUsersView.tsx updated successfully');
