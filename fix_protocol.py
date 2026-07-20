#!/usr/bin/env python3
"""Fix all inline onclick/oninput/onchange violations → data-* + event delegation"""
import re, os

# ============================================================
# STEP 1: Fix app.js
# ============================================================
with open('app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix toggle password
c = c.replace('onclick="window.togglePasswordGlobal()"', 'data-action="toggle-password"')

# Fix login button
c = c.replace('onclick="window.APP && window.APP.doLogin();"', 'data-action="do-login"')

# Fix install pwa
c = c.replace('onclick="window.APP && window.APP.installPWA();"', 'data-action="install-pwa"')

# Fix export menu
c = c.replace('onclick="window.APP && window.APP.showExportMenu(event);"', 'data-action="show-export-menu"')

# Fix sidebar backdrop
c = c.replace('onclick="window.toggleSidebarGlobal();"', 'data-action="toggle-sidebar"')

# Fix menu toggle
c = c.replace('onclick="window.toggleSidebarGlobal();"', 'data-action="toggle-sidebar"')

# Fix modal-close buttons (inline)
c = c.replace("onclick=\"this.closest('.modal-overlay').remove();\">", 'data-action="modal-close">')
c = c.replace("onclick=\"this.closest('.modal-overlay').remove();\">", 'data-action="modal-close">')

# Now replace the old inline onclick assignments with event delegation
# Remove the .onclick = () => { blocks (they're dead code after data-action fix)
# These were:
#   applyUpdateBtn.onclick = () => { ... }
#   dismissUpdateBtn.onclick = () => { ... }

# Find and remove those blocks
c = re.sub(
    r"\n\s*document\.getElementById\('applyUpdateBtn'\)\.onclick\s*=\s*\(\)\s*=>\s*\{[^}]*\}",
    '', c
)
c = re.sub(
    r"\n\s*document\.getElementById\('dismissUpdateBtn'\)\.onclick\s*=\s*\(\)\s*=>\s*\{[^}]*\}",
    '', c
)

# Add global click handler AFTER window.APP is defined
# Find the spot: after "window.APP = (function(){" block
# We'll add the delegation right after the login form handling

# Find "APP.init();" and add click delegation before it
click_delegation = """
  // === Global click delegation (no inline onclick) ===
  document.addEventListener('click', function(e) {
    const action = e.target.closest('[data-action]') && e.target.closest('[data-action]').dataset.action;
    if (!action) return;
    switch(action) {
      case 'toggle-password': window.togglePasswordGlobal(); break;
      case 'toggle-sidebar': window.toggleSidebarGlobal(); break;
      case 'do-login': window.APP && window.APP.doLogin(); break;
      case 'install-pwa': window.APP && window.APP.installPWA(); break;
      case 'show-export-menu': window.APP && window.APP.showExportMenu(e); break;
      case 'modal-close':
        var m = e.target.closest('.modal-overlay') || e.target.closest('.modal-content') || e.target.closest('[class*="modal"]');
        if (m) m.style.display = 'none';
        break;
    }
  });
"""

# Insert before APP.init()
c = c.replace('\n  APP.init();', click_delegation + '\n  APP.init();')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(c)
print("app.js fixed")

# ============================================================
# STEP 2: Fix modules.js
# ============================================================
with open('modules.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace all onclick with data-action
c = c.replace("onclick=\"APP.navigate('production')\"", "data-action=\"nav-production\"")
c = c.replace("onclick=\"Modules._addProduction()\"", "data-action=\"add-production\"")
c = c.replace("onclick=\"document.getElementById('prodForm').reset()\"", "data-action=\"reset-prod-form\"")
c = c.replace("onclick=\"Modules.exportTable('productionLog', 'سجل_الإنتاج')\"", "data-action=\"export-production\"")
c = c.replace("onclick=\"Modules._deleteProduction(", "data-action=\"delete-production\" data-idx=\"")
c = c.replace("onclick=\"Modules._saveCostSettings()\"", "data-action=\"save-cost-settings\"")

# Fix delete button (special case - onclick had the function call)
# onclick="Modules._deleteProduction(${db.productionLog.length - 1 - idx})"
# becomes: data-action="delete-production" data-idx="${db.productionLog.length - 1 - idx}"

# Add click delegation at the end of modules.js (before closing)
modules_click = """
// === Event delegation (no inline onclick) ===
document.addEventListener('click', function(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  switch(action) {
    case 'nav-production': APP.navigate('production'); break;
    case 'add-production': Modules._addProduction(); break;
    case 'reset-prod-form': document.getElementById('prodForm') && document.getElementById('prodForm').reset(); break;
    case 'export-production': Modules.exportTable && Modules.exportTable('productionLog', 'سجل_الإنتاج'); break;
    case 'delete-production': Modules._deleteProduction && Modules._deleteProduction(el.dataset.idx); break;
    case 'save-cost-settings': Modules._saveCostSettings && Modules._saveCostSettings(); break;
  }
});
"""

# Insert before the closing of modules
# Find the last line
lines = c.rstrip().split('\n')
last = lines[-1]
# Make sure it's the last line
c = c.rstrip() + '\n' + modules_click + '\n'
# Remove any trailing close brace issues
with open('modules.js', 'w', encoding='utf-8') as f:
    f.write(c)
print("modules.js fixed")

# ============================================================
# STEP 3: Fix modules2.js - comprehensive
# ============================================================
with open('modules2.js', 'r', encoding='utf-8') as f:
    c = f.read()

# ---- onclick replacements ----
replacements = [
    # Pricing
    ("onclick=\"Modules._savePricing()\"", 'data-action="save-pricing"'),
    # Vouchers
    ("onclick=\"Modules._addVoucher()\"", 'data-action="add-voucher"'),
    ("onclick=\"Modules._deleteVoucher(", 'data-action="delete-voucher" data-vidx="'),
    # Sales
    ("onclick=\"Modules.exportTable('salesReps', 'أداء_المناديب')\"", 'data-action="export-sales"'),
    # Agents
    ("onclick=\"Modules._deleteAgent(", 'data-action="delete-agent" data-aidx="'),
    ("onclick=\"Modules._addAgent()\"", 'data-action="add-agent"'),
    # Lab
    ("onclick=\"Modules._addLab()\"", 'data-action="add-lab"'),
    # Purchase requests (procurement)
    ("onclick=\"Modules._prViewIncoming(", 'data-action="pr-view-incoming" data-pidx="'),
    ("onclick=\"Modules._prApprove(", 'data-action="pr-approve" data-pidx="'),
    ("onclick=\"Modules._prReject(", 'data-action="pr-reject" data-pidx="'),
    ("onclick=\"Modules._prToggleRequests()\"", 'data-action="pr-toggle-all"'),
    ("onclick=\"Modules._addPurchase()\"", 'data-action="add-purchase"'),
    # HR tabs
    ("onclick=\"Modules._hrTab('registry')\"", 'data-action="hr-tab-registry"'),
    ("onclick=\"APP.navigate('orgtree')\"", "data-action=\"nav-orgtree\""),
    ("onclick=\"APP.navigate('orgchart')\"", "data-action=\"nav-orgchart\""),
    ("onclick=\"APP.navigate('permissions')\"", "data-action=\"nav-permissions\""),
    ("onclick=\"APP.navigate('terminated')\"", "data-action=\"nav-terminated\""),
    ("onclick=\"Modules._addEmployee()\"", 'data-action="add-employee"'),
    ("onclick=\"Modules._editEmployee(", 'data-action="edit-employee" data-eid="'),
    ("onclick=\"Modules._changeStatus(", 'data-action="change-status" data-eid="'),
    ("onclick=\"Modules._deleteEmployee(", 'data-action="delete-employee" data-eid="'),
    ("onclick=\"Modules._toggleDeptSection(", 'data-action="toggle-dept" data-didx="'),
    ("onclick=\"document.getElementById('editEmpModal').style.display='none'\"", 'data-action="modal-close"'),
    ("onclick=\"Modules._saveEmployee()\"", 'data-action="save-employee"'),
    # Users
    ("onclick=\"Modules._saveUser()\"", 'data-action="save-user"'),
    ("onclick=\"Modules._cancelUserEdit()\"", 'data-action="cancel-user-edit"'),
    ("onclick=\"Modules._addUser()\"", 'data-action="add-user"'),
    ("onclick=\"Modules._editUser(", 'data-action="edit-user" data-uidx="'),
    ("onclick=\"Modules._toggleUser(", 'data-action="toggle-user" data-uidx="'),
    ("onclick=\"Modules._editPermissions(", 'data-action="edit-permissions" data-puid="'),
    ("onclick=\"Modules._savePermissions(", 'data-action="save-permissions" data-spuid="'),
    # Profile
    ("onclick=\"Modules._changePassword()\"", 'data-action="change-password"'),
    ("onclick=\"Modules._saveIDCardData(", 'data-action="save-idcard" data-eid="'),
    ("onclick=\"Modules._deleteEmployeeDocument(", 'data-action="delete-doc" data-eid=" data-doctype="'),
    ("onclick=\"Modules._terminateEmployee(", 'data-action="terminate-employee" data-eid="'),
    ("onclick=\"APP.navigate('newRequest')\"", "data-action=\"nav-new-request\""),
    # Production/procurement
    ("onclick=\"Modules._prStartSpare()\"", 'data-action="pr-start-spare"'),
    ("onclick=\"Modules._prSwitchTab(", 'data-action="pr-tab" data-tab="'),
    ("onclick=\"Modules._prEditRequest(", 'data-action="pr-edit" data-pidx="'),
    ("onclick=\"Modules._prCancelRequest(", 'data-action="pr-cancel" data-pidx="'),
    ("onclick=\"Modules._prRemind(", 'data-action="pr-remind" data-pidx="'),
    ("onclick=\"Modules._prViewRequest(", 'data-action="pr-view" data-pidx="'),
    ("onclick=\"Modules._prSubmitRaw()\"", 'data-action="pr-submit-raw"'),
    ("onclick=\"Modules._prAddSpareItem()\"", 'data-action="pr-add-spare-item"'),
    ("onclick=\"Modules._prSubmitSpare(", 'data-action="pr-submit-spare" data-sid="'),
    ("onclick=\"this.closest('.spare-item-form').remove(); Modules._prRenumberItems();\"", 'data-action="remove-spare-item"'),
    # Self-service
    ("onclick=\"Modules._viewRequest(", 'data-action="view-request" data-rid="'),
    ("onclick=\"Modules._cancelRequest(", 'data-action="cancel-request" data-rid="'),
    ("onclick=\"Modules._approveRequest(", 'data-action="approve-request" data-rid="'),
    ("onclick=\"Modules._rejectRequestUI(", 'data-action="reject-request" data-rid="'),
    ("onclick=\"Modules._selectRequestType(", 'data-action="select-req-type" data-tid="'),
    ("onclick=\"Modules._submitRequest(", 'data-action="submit-request"'),
    # Onmouseover/onmouseout
    ("onmouseover=\"this.style.transform='translateY(-3px)'\"", ''),
    ("onmouseout=\"this.style.transform='translateY(0)'\"", ''),
    # Modal close
    ("onclick=\"this.closest('.modal-overlay').remove()\"", 'data-action="modal-close"'),
    # Reset form
    ("onclick=\"document.getElementById('userForm').reset()\"", 'data-action="reset-user-form"'),
    # Delete voucher real index
    ("onclick=\"Modules._deleteVoucher(${realIdx})\"", 'data-action="delete-voucher" data-vidx="${realIdx}"'),
    # PR Delete flow
    ("onclick=\"Modules._deleteFlow(", 'data-action="delete-flow" data-fid="'),
    # Lab delete
    ("onclick=\"Modules._deleteLab(", 'data-action="delete-lab" data-lidx="'),
]

for old, new in replacements:
    c = c.replace(old, new)

# ---- Special: onclick with ID-based close ----
# These are file-trigger buttons that open file inputs
c = re.sub(
    r"onclick=\"document\.getElementById\('photo-input'\)\.click\(\)\"",
    "data-action=\"file-trigger\" data-target=\"photo-input\"",
    c
)
c = re.sub(
    r"onclick=\"document\.getElementById\('id-input'\)\.click\(\)\"",
    "data-action=\"file-trigger\" data-target=\"id-input\"",
    c
)
c = re.sub(
    r"onclick=\"document\.getElementById\('cv-input'\)\.click\(\)\"",
    "data-action=\"file-trigger\" data-target=\"cv-input\"",
    c
)
c = re.sub(
    r"onclick=\"document\.getElementById\('cert-input'\)\.click\(\)\"",
    "data-action=\"file-trigger\" data-target=\"cert-input\"",
    c
)
c = re.sub(
    r"onclick=\"document\.getElementById\('restoreFile'\)\.click\(\)\"",
    "data-action=\"file-trigger\" data-target=\"restoreFile\"",
    c
)

# ---- oninput replacements ----
c = c.replace("oninput=\"Modules._pRecalculate()\"", 'data-change="calc-p"')
c = c.replace("oninput=\"Modules._prRecalculate()\"", 'data-change="calc-pr"')
c = c.replace("oninput=\"Modules._filterDepts()\"", 'data-input="filter-depts"')
c = c.replace("oninput=\"Modules._filterUsers()\"", 'data-input="filter-users"')

# ---- onchange replacements ----
c = c.replace("onchange=\"Modules._pSupplierChanged()\"", 'data-change="supplier-changed"')
c = c.replace("onchange=\"Modules._pMaterialChanged()\"", 'data-change="material-changed"')
c = c.replace("onchange=\"Modules._pRecalculate()\"", 'data-change="calc-p"')
c = c.replace("onchange=\"Modules._prMachineChanged()\"", 'data-change="machine-changed"')
c = c.replace("onchange=\"Modules._onSubTypeChange(", "data-change=\"subtype-change\" data-typeid=\"")
c = c.replace("onchange=\"Modules._handleFileUpload(this, 'photo', ${emp.id})\"",
              "data-change=\"file-upload\" data-type=\"photo\" data-eid=\"${emp.id}\"")
c = c.replace("onchange=\"Modules._handleFileUpload(this, 'idCardPhoto', ${emp.id})\"",
              "data-change=\"file-upload\" data-type=\"idCardPhoto\" data-eid=\"${emp.id}\"")
c = c.replace("onchange=\"Modules._handleFileUpload(this, 'cv', ${emp.id})\"",
              "data-change=\"file-upload\" data-type=\"cv\" data-eid=\"${emp.id}\"")
c = c.replace("onchange=\"Modules._handleFileUpload(this, 'certificate', ${emp.id})\"",
              "data-change=\"file-upload\" data-type=\"certificate\" data-eid=\"${emp.id}\"")
c = c.replace("onchange=\"Modules._dev_restoreFile(event)\"",
              "data-change=\"restore-file\"")
c = c.replace("onchange=\"Modules._prHandlePhoto(this, 'machinePhoto', ${idx})\"",
              "data-change=\"spare-photo\" data-ptype=\"machinePhoto\" data-pidx=\"${idx}\"")
c = c.replace("onchange=\"Modules._prHandlePhoto(this, 'partPhoto', ${idx})\"",
              "data-change=\"spare-photo\" data-ptype=\"partPhoto\" data-pidx=\"${idx}\"")
c = c.replace("onchange=\"Modules._prHandlePhoto(this, 'nameplatePhoto', ${idx})\"",
              "data-change=\"spare-photo\" data-ptype=\"nameplatePhoto\" data-pidx=\"${idx}\"")

# Handle the subType change special case - it had extra closing parens
c = re.sub(r"onchange=\"Modules\._onSubTypeChange\('([^']+)'\)\"", 
           "data-change=\"subtype-change\" data-typeid=\"\\1\"", c)

with open('modules2.js', 'w', encoding='utf-8') as f:
    f.write(c)
print("modules2.js inline attributes fixed")

# ============================================================
# STEP 4: Fix reports.js
# ============================================================
with open('reports.js', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("onclick=\"Modules.exportToPDF()\"", 'data-action="export-pdf"')
c = c.replace("onclick=\"Modules.exportToExcel()\"", 'data-action="export-excel"')
c = c.replace("onclick=\"window.print()\"", 'data-action="print-page"')
c = c.replace("onclick=\"Modules.exportBackup()\"", 'data-action="export-backup"')

with open('reports.js', 'w', encoding='utf-8') as f:
    f.write(c)
print("reports.js fixed")

# ============================================================
# STEP 5: Add event delegation to modules2.js
# This is the BIGGEST task - append delegation code at the END
# ============================================================
# We need to add delegation for the entire document (since modules2.js
# doesn't have a single container reference in the file).
# We use document-level delegation.

delegation = """
// ============================================================
// GLOBAL EVENT DELEGATION - NO INLINE onclick/oninput/onchange
// All module interactions go through data-* attributes
// ============================================================
(function() {
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;

    // --- Pricing ---
    if (action === 'save-pricing') { Modules._savePricing && Modules._savePricing(); return; }

    // --- Vouchers ---
    if (action === 'add-voucher') { Modules._addVoucher && Modules._addVoucher(); return; }
    if (action === 'delete-voucher') { var idx = parseInt(el.dataset.vidx); Modules._deleteVoucher && Modules._deleteVoucher(idx); return; }

    // --- Sales ---
    if (action === 'export-sales') { Modules.exportTable && Modules.exportTable('salesReps', 'أداء_المناديب'); return; }

    // --- Agents ---
    if (action === 'delete-agent') { var idx = parseInt(el.dataset.aidx); Modules._deleteAgent && Modules._deleteAgent(idx); return; }
    if (action === 'add-agent') { Modules._addAgent && Modules._addAgent(); return; }

    // --- Lab ---
    if (action === 'add-lab') { Modules._addLab && Modules._addLab(); return; }
    if (action === 'delete-lab') { var idx = parseInt(el.dataset.lidx); Modules._deleteLab && Modules._deleteLab(idx); return; }

    // --- Cash Flow (in modules2.js already has its own delegation) ---
    if (['add-incoming','add-outgoing','auto-post','view-alerts','add-customer-credit',
         'edit-credit','unblock-credit','receive-payment','resolve-alert',
         'mark-read','delete-flow','close-modal'].indexOf(action) !== -1) { return; /* handled by module */ }

    // --- Procurement / Purchase Requests ---
    if (action === 'pr-view-incoming') { var pidx = parseInt(el.dataset.pidx); Modules._prViewIncoming && Modules._prViewIncoming(pidx); return; }
    if (action === 'pr-approve') { var pidx = parseInt(el.dataset.pidx); Modules._prApprove && Modules._prApprove(pidx); return; }
    if (action === 'pr-reject') { var pidx = parseInt(el.dataset.pidx); Modules._prReject && Modules._prReject(pidx); return; }
    if (action === 'pr-toggle-all') { Modules._prToggleRequests && Modules._prToggleRequests(); return; }
    if (action === 'add-purchase') { Modules._addPurchase && Modules._addPurchase(); return; }

    // --- HR Tabs ---
    if (action === 'hr-tab-registry') { Modules._hrTab && Modules._hrTab('registry'); return; }
    if (action === 'nav-orgtree') { APP.navigate && APP.navigate('orgtree'); return; }
    if (action === 'nav-orgchart') { APP.navigate && APP.navigate('orgchart'); return; }
    if (action === 'nav-permissions') { APP.navigate && APP.navigate('permissions'); return; }
    if (action === 'nav-terminated') { APP.navigate && APP.navigate('terminated'); return; }

    // --- HR Employees ---
    if (action === 'add-employee') { Modules._addEmployee && Modules._addEmployee(); return; }
    if (action === 'edit-employee') { Modules._editEmployee && Modules._editEmployee(el.dataset.eid); return; }
    if (action === 'change-status') { Modules._changeStatus && Modules._changeStatus(el.dataset.eid); return; }
    if (action === 'delete-employee') { Modules._deleteEmployee && Modules._deleteEmployee(el.dataset.eid); return; }
    if (action === 'toggle-dept') { Modules._toggleDeptSection && Modules._toggleDeptSection(parseInt(el.dataset.didx)); return; }
    if (action === 'save-employee') { Modules._saveEmployee && Modules._saveEmployee(); return; }

    // --- HR Users ---
    if (action === 'save-user') { Modules._saveUser && Modules._saveUser(); return; }
    if (action === 'cancel-user-edit') { Modules._cancelUserEdit && Modules._cancelUserEdit(); return; }
    if (action === 'add-user') { Modules._addUser && Modules._addUser(); return; }
    if (action === 'edit-user') { Modules._editUser && Modules._editUser(parseInt(el.dataset.uidx)); return; }
    if (action === 'toggle-user') { Modules._toggleUser && Modules._toggleUser(parseInt(el.dataset.uidx)); return; }
    if (action === 'edit-permissions') { Modules._editPermissions && Modules._editPermissions(parseInt(el.dataset.puid)); return; }
    if (action === 'save-permissions') { Modules._savePermissions && Modules._savePermissions(parseInt(el.dataset.spuid)); return; }
    if (action === 'reset-user-form') { var uf = document.getElementById('userForm'); if (uf) uf.reset(); return; }

    // --- Profile ---
    if (action === 'change-password') { Modules._changePassword && Modules._changePassword(); return; }
    if (action === 'save-idcard') { Modules._saveIDCardData && Modules._saveIDCardData(parseInt(el.dataset.eid)); return; }
    if (action === 'terminate-employee') { Modules._terminateEmployee && Modules._terminateEmployee(parseInt(el.dataset.eid)); return; }
    if (action === 'nav-new-request') { APP.navigate && APP.navigate('newRequest'); return; }

    // --- Documents ---
    if (action === 'delete-doc') {
      Modules._deleteEmployeeDocument && Modules._deleteEmployeeDocument(parseInt(el.dataset.eid), el.dataset.doctype);
      return;
    }

    // --- Spare Requests ---
    if (action === 'pr-start-spare') { Modules._prStartSpare && Modules._prStartSpare(); return; }
    if (action === 'pr-tab') { Modules._prSwitchTab && Modules._prSwitchTab(el.dataset.tab); return; }
    if (action === 'pr-edit') { Modules._prEditRequest && Modules._prEditRequest(parseInt(el.dataset.pidx)); return; }
    if (action === 'pr-cancel') { Modules._prCancelRequest && Modules._prCancelRequest(parseInt(el.dataset.pidx)); return; }
    if (action === 'pr-remind') { Modules._prRemind && Modules._prRemind(parseInt(el.dataset.pidx)); return; }
    if (action === 'pr-view') { Modules._prViewRequest && Modules._prViewRequest(parseInt(el.dataset.pidx)); return; }
    if (action === 'pr-submit-raw') { Modules._prSubmitRaw && Modules._prSubmitRaw(); return; }
    if (action === 'pr-add-spare-item') { Modules._prAddSpareItem && Modules._prAddSpareItem(); return; }
    if (action === 'pr-submit-spare') { Modules._prSubmitSpare && Modules._prSubmitSpare(el.dataset.sid === 'null' ? null : el.dataset.sid); return; }
    if (action === 'remove-spare-item') { var f = el.closest('.spare-item-form'); if (f) f.remove(); Modules._prRenumberItems && Modules._prRenumberItems(); return; }

    // --- Self-service ---
    if (action === 'view-request') { Modules._viewRequest && Modules._viewRequest(el.dataset.rid); return; }
    if (action === 'cancel-request') { Modules._cancelRequest && Modules._cancelRequest(el.dataset.rid); return; }
    if (action === 'approve-request') { Modules._approveRequest && Modules._approveRequest(el.dataset.rid); return; }
    if (action === 'reject-request') { Modules._rejectRequestUI && Modules._rejectRequestUI(el.dataset.rid); return; }
    if (action === 'select-req-type') { Modules._selectRequestType && Modules._selectRequestType(el.dataset.tid); return; }
    if (action === 'submit-request') { Modules._submitRequest && Modules._submitRequest(el.dataset.typeid, el.dataset.subtypeid); return; }

    // --- Reports ---
    if (action === 'export-pdf') { Modules.exportToPDF && Modules.exportToPDF(); return; }
    if (action === 'export-excel') { Modules.exportToExcel && Modules.exportToExcel(); return; }
    if (action === 'export-backup') { Modules.exportBackup && Modules.exportBackup(); return; }
    if (action === 'print-page') { window.print && window.print(); return; }

    // --- File trigger (opens file input) ---
    if (action === 'file-trigger') { var target = el.dataset.target; var inp = document.getElementById(target); if (inp) inp.click(); return; }

    // --- Modal close ---
    if (action === 'modal-close') {
      var m = el.closest('.modal-overlay') || el.closest('.modal-content') ||
              el.closest('[class*="modal"]') || el.closest('[id*="modal"]') ||
              el.closest('#editEmpModal') || el.closest('#permissionsModal') ||
              el.closest('#requestDetailModal') || el.closest('#newRequestForm') ||
              el.closest('.modal');
      if (m) { m.style.display = 'none'; return; }
      // Handle specific target
      var target = el.dataset.target;
      if (target) { var specific = document.getElementById(target); if (specific) specific.style.display = 'none'; }
      return;
    }
  });

  // --- INPUT delegation (data-input attributes) ---
  document.addEventListener('input', function(e) {
    var el = e.target;
    var inp = el.dataset.input;
    if (!inp) return;
    if (inp === 'filter-depts') { Modules._filterDepts && Modules._filterDepts(); return; }
    if (inp === 'filter-users') { Modules._filterUsers && Modules._filterUsers(); return; }
  });

  // --- CHANGE delegation (data-change attributes) ---
  document.addEventListener('change', function(e) {
    var el = e.target;
    var chg = el.dataset.change;
    if (!chg) return;
    if (chg === 'calc-p') { Modules._pRecalculate && Modules._pRecalculate(); return; }
    if (chg === 'calc-pr') { Modules._prRecalculate && Modules._prRecalculate(); return; }
    if (chg === 'supplier-changed') { Modules._pSupplierChanged && Modules._pSupplierChanged(); return; }
    if (chg === 'material-changed') { Modules._pMaterialChanged && Modules._pMaterialChanged(); return; }
    if (chg === 'machine-changed') { Modules._prMachineChanged && Modules._prMachineChanged(); return; }
    if (chg === 'subtype-change') {
      Modules._onSubTypeChange && Modules._onSubTypeChange(el.dataset.typeid);
      return;
    }
    if (chg === 'file-upload') {
      Modules._handleFileUpload && Modules._handleFileUpload(el, el.dataset.type, parseInt(el.dataset.eid));
      return;
    }
    if (chg === 'restore-file') {
      Modules._dev_restoreFile && Modules._dev_restoreFile(e);
      return;
    }
    if (chg === 'spare-photo') {
      Modules._prHandlePhoto && Modules._prHandlePhoto(el, el.dataset.ptype, parseInt(el.dataset.pidx));
      return;
    }
  });
})();
"""

with open('modules2.js', 'a', encoding='utf-8') as f:
    f.write('\n' + delegation)
print("modules2.js delegation added")

print("\nAll files fixed!")
