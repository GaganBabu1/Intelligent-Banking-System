# E2E Testing & Verification Guide

## Prerequisites
- Backend running on http://localhost:8080
- Frontend running on http://localhost:5173
- Both services accessible and connected

## Test Scenarios

### 1. Authentication & Authorization

#### Test 1.1: User Registration
- [ ] Navigate to `/register`
- [ ] Fill form with valid data:
  - First Name: John
  - Last Name: Doe
  - Email: john.doe@example.com
  - Phone: +1-234-567-8900
  - Address: 123 Main St
  - Password: SecurePass123!
  - Confirm: SecurePass123!
- [ ] Verify form validation shows errors for:
  - Empty required fields
  - Invalid email format
  - Password < 8 chars
  - Mismatched passwords
  - Invalid phone format
- [ ] Submit valid form
- [ ] Verify success toast notification
- [ ] Verify redirect to dashboard
- [ ] Verify user data stored in localStorage
- [ ] **Expected:** Success notification, redirect, localStorage contains user/tokens

#### Test 1.2: User Login
- [ ] Logout (if logged in)
- [ ] Navigate to `/login`
- [ ] Test validation:
  - Empty email/password shows error
  - Invalid email format rejected
  - Too short password rejected
- [ ] Enter registered credentials:
  - Email: john.doe@example.com
  - Password: SecurePass123!
- [ ] Submit form
- [ ] Verify success toast
- [ ] Verify redirect to dashboard
- [ ] Verify localStorage contains:
  - `accessToken` (JWT with ~15 min expiry)
  - `refreshToken` (JWT with ~7 day expiry)
  - `user` (JSON with id, firstName, email, role)
- [ ] **Expected:** Successful login, tokens stored, dashboard loads

#### Test 1.3: Token Refresh on 401
- [ ] While logged in, open browser DevTools → Network tab
- [ ] Make a request to any protected endpoint
- [ ] Verify request includes `Authorization: Bearer <accessToken>` header
- [ ] To test refresh logic:
  - Manually delete/expire `accessToken` in localStorage (keep `refreshToken`)
  - Refresh the page or make a new request
  - Verify axios interceptor calls refresh endpoint
  - Verify new `accessToken` generated and stored
  - Verify original request retried successfully
- [ ] **Expected:** Automatic token refresh, no manual re-login needed

#### Test 1.4: Protected Routes Redirect
- [ ] Logout completely
- [ ] Navigate directly to `/accounts` or `/create-account`
- [ ] Verify redirect to `/login`
- [ ] Navigate to `/dashboard`
- [ ] Verify redirect to `/login`
- [ ] Navigate to `/admin/dashboard` (without admin role)
- [ ] Verify redirect to `/login` (or 403 if design supports)
- [ ] Login as regular user
- [ ] Attempt to access `/admin/dashboard`
- [ ] Verify access denied or redirect
- [ ] **Expected:** All protected routes redirect to login when unauthenticated

---

### 2. Banking Operations

#### Test 2.1: Create Account
- [ ] Login as user
- [ ] Navigate to `/create-account`
- [ ] Verify form loads with name auto-filled from profile
- [ ] Test validation:
  - Empty account name rejected
  - Balance < ₹1 rejected
  - Balance > ₹1,00,00,000 rejected
  - Non-numeric balance rejected
- [ ] Fill form:
  - Account Holder Name: John Doe Savings
  - Initial Balance: 50000
- [ ] Submit form
- [ ] Verify success notification
- [ ] Verify account details displayed:
  - Account number (16 digits)
  - Account holder name
  - Initial balance (₹50,000)
  - Status: ACTIVE
- [ ] Click "Go to Dashboard"
- [ ] Verify account appears in account list
- [ ] **Expected:** Account created, visible in dashboard with correct balance

#### Test 2.2: Deposit
- [ ] Navigate to `/deposit`
- [ ] Verify account dropdown populated with user's accounts
- [ ] Select an account
- [ ] Test validation:
  - Empty amount rejected
  - Amount ≤ ₹0 rejected
  - Non-numeric amount rejected
- [ ] Enter deposit amount: 10000
- [ ] Submit form
- [ ] Verify success notification with amount
- [ ] Verify balance updated in account list
- [ ] Verify old balance → new balance calculation correct
- [ ] **Expected:** Balance increased by deposit amount

#### Test 2.3: Withdraw
- [ ] Navigate to `/withdraw`
- [ ] Select account with sufficient balance
- [ ] Test validation:
  - Amount > balance rejected with "Insufficient balance"
  - Empty amount rejected
- [ ] Enter withdrawal amount: 5000
- [ ] Submit form
- [ ] Verify success notification
- [ ] Verify balance decreased correctly
- [ ] Attempt withdraw with amount > balance
- [ ] Verify error: "Insufficient balance"
- [ ] **Expected:** Successful withdrawal decreases balance, overdraft blocked

#### Test 2.4: Transfer
- [ ] Create 2nd account (or have 2 accounts)
- [ ] Navigate to `/transfer`
- [ ] Verify both accounts in from/to dropdowns
- [ ] Test validation:
  - Empty fields rejected
  - Invalid amount rejected
  - Transfer to same account rejected
  - Transfer > balance rejected
- [ ] Note daily transfer limit displayed (e.g., ₹1,00,000)
- [ ] Transfer ₹20,000 from Account 1 to Account 2
- [ ] Submit form
- [ ] Verify success notification
- [ ] Verify Account 1 balance decreased
- [ ] Verify Account 2 balance increased
- [ ] Verify transaction shows in history for both accounts
- [ ] Attempt transfer exceeding daily limit
- [ ] Verify error: "Daily transfer limit exceeded"
- [ ] **Expected:** Transfer succeeds, balances updated, daily limit enforced

#### Test 2.5: Transaction History
- [ ] Navigate to `/history`
- [ ] Verify account dropdown populated
- [ ] Select account with multiple transactions
- [ ] Verify transactions table shows:
  - Date
  - Transaction Ref (UUID)
  - Type (DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT)
  - Status (SUCCESS, FAILED)
  - From/To account numbers
  - Amount
  - Balance after transaction
- [ ] Test filters:
  - Scope (All / Incoming / Outgoing)
  - Type (All types / Deposit / Withdraw / Transfer)
  - Search by ref/description
- [ ] Test pagination:
  - Change page size (5, 10, 20)
  - Navigate between pages
  - Verify correct transactions per page
- [ ] Verify loading spinner appears while fetching
- [ ] **Expected:** All transactions visible, filters/pagination work, correct balances

#### Test 2.6: User Profile
- [ ] Navigate to `/profile`
- [ ] Verify profile view loads with:
  - User avatar (initials)
  - First name, last name
  - Email
  - Phone number
  - Address
  - Account status
  - Member since date
- [ ] Click "Edit Profile"
- [ ] Modify fields:
  - Change first name
  - Change phone number
- [ ] Submit form
- [ ] Verify success notification: "Profile updated"
- [ ] Verify header/sidebar shows updated name immediately
- [ ] Refresh page
- [ ] Verify changes persisted
- [ ] Click "Cancel" during edit
- [ ] Verify reverts to view mode without saving
- [ ] **Expected:** Profile editable, changes persisted, header reflects updates

---

### 3. Admin Features

#### Test 3.1: Admin Access
- [ ] Logout and create an admin account (if available via backend)
- [ ] Or modify `user.role` to "ADMIN" in localStorage (for testing)
- [ ] Login/refresh page
- [ ] Verify "Admin" link appears in sidebar
- [ ] Click Admin Dashboard
- [ ] Verify access granted (no redirect)
- [ ] **Expected:** Admin users can access admin routes

#### Test 3.2: Admin Dashboard
- [ ] Navigate to `/admin/dashboard`
- [ ] Verify three tabs: Dashboard, Users, Accounts
- [ ] **Dashboard tab:**
  - Total Users count displayed
  - Total Accounts count displayed
  - Active Accounts count
  - Frozen Accounts count
  - Total Active Balance
  - Verify loading spinner appears while fetching stats
- [ ] **Users tab:**
  - Table shows all users
  - Columns: Name, Email, Phone, Role, Status
  - Verify admin users marked as ADMIN
  - Verify enabled/disabled status
- [ ] **Accounts tab:**
  - Table shows all accounts
  - Columns: Account #, Holder, Balance, Status, Created
  - Verify ACTIVE/FROZEN status
- [ ] **Expected:** All admin sections load correctly with data

#### Test 3.3: Non-Admin Blocked
- [ ] Logout and login as regular user
- [ ] Attempt to navigate to `/admin/dashboard`
- [ ] Verify access denied (redirect or error)
- [ ] Verify "Admin" link not in sidebar
- [ ] **Expected:** Non-admins cannot access admin features

---

### 4. UI/UX & Error Handling

#### Test 4.1: Form Validation Messages
- [ ] Fill Login form with empty email
- [ ] Verify red error message below field: "Email is required"
- [ ] Fill with invalid email "test"
- [ ] Verify error: "Invalid email format"
- [ ] Verify error color is red (danger color)
- [ ] Verify error hint styling matches design
- [ ] **Expected:** Clear inline validation errors with proper styling

#### Test 4.2: Toast Notifications
- [ ] Perform successful registration
- [ ] Verify green success toast appears top-right
- [ ] Verify toast contains success icon (✓)
- [ ] Verify close (×) button works
- [ ] Wait for auto-dismiss (4-5 seconds)
- [ ] Perform failed login (wrong password)
- [ ] Verify red error toast appears
- [ ] Verify error icon (✕) displays
- [ ] **Expected:** Toasts appear, auto-dismiss, can be manually closed

#### Test 4.3: Loading States
- [ ] During account creation, verify button shows "Creating Account..."
- [ ] During deposit, verify "Processing..."
- [ ] Verify loading spinner on Dashboard accounts section
- [ ] Verify loading spinner on TransactionHistory
- [ ] Verify Loader component displays message
- [ ] **Expected:** Clear loading feedback during all async operations

#### Test 4.4: Responsive Design
- [ ] Resize browser to mobile width (< 768px)
- [ ] Verify sidebar collapses/hidden
- [ ] Verify content takes full width
- [ ] Verify forms stack vertically
- [ ] Verify buttons are clickable
- [ ] Verify text is readable
- [ ] Resize to tablet (768-1024px)
- [ ] Verify grid layouts adapt
- [ ] Verify table scrolls horizontally if needed
- [ ] **Expected:** Responsive layout works at all breakpoints

#### Test 4.5: Error Handling
- [ ] Attempt to deposit more than available (after withdrawal)
- [ ] Verify error toast: "Insufficient balance"
- [ ] Attempt to create account with duplicate name
- [ ] Verify backend error displayed in toast
- [ ] Disconnect backend
- [ ] Attempt any operation
- [ ] Verify network error handled gracefully
- [ ] Verify error message suggests retrying
- [ ] **Expected:** All errors handled with user-friendly messages

---

### 5. Browser DevTools Checks

#### Test 5.1: Network Requests
- [ ] Open DevTools → Network tab
- [ ] Perform login
- [ ] Verify POST `/api/auth/login` request
- [ ] Verify response contains `accessToken` and `refreshToken`
- [ ] Verify Authorization header on subsequent requests
- [ ] Perform create account
- [ ] Verify POST `/api/accounts/create` request
- [ ] Verify response contains account details
- [ ] **Expected:** Correct endpoints called with proper auth headers

#### Test 5.2: Console Errors
- [ ] Open DevTools → Console tab
- [ ] Perform all major operations
- [ ] Verify NO React errors logged
- [ ] Verify NO unhandled promise rejections
- [ ] Verify NO 404s for assets
- [ ] **Expected:** Console clean (no critical errors)

#### Test 5.3: LocalStorage
- [ ] Open DevTools → Application → LocalStorage
- [ ] Verify after login:
  - `accessToken` exists (JWT format)
  - `refreshToken` exists (JWT format)
  - `user` exists (JSON with user data)
- [ ] Verify after logout: all three cleared
- [ ] **Expected:** Auth data persisted correctly

---

## Known Limitations & Notes
- Refresh token rotation may not be tested fully without backend mock
- Admin features require admin role (manual setup or backend test account)
- Some backend edge cases may not be caught without integration tests
- Performance testing not included (would require load testing tools)

## Summary Checklist
- [ ] Registration flow works end-to-end
- [ ] Login generates and stores tokens
- [ ] Token refresh works on 401
- [ ] Protected routes redirect correctly
- [ ] All banking operations succeed
- [ ] Transaction history displays correctly
- [ ] Profile updates work and persist
- [ ] Admin features access-controlled
- [ ] Form validation shows clear errors
- [ ] Toast notifications appear/dismiss
- [ ] Loading states display
- [ ] Responsive design works
- [ ] Error handling is graceful
- [ ] No console errors
- [ ] LocalStorage used correctly
