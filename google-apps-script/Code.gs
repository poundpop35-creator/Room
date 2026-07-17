/**
 * แผนเงินบำรุง — Google Sheets backend (Apps Script Web App)
 *
 * Paste this whole file into Extensions > Apps Script of a Google Sheet,
 * run setupSheets() once (Run menu, authorize when prompted), then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Copy the resulting /exec URL into NEXT_PUBLIC_API_BASE_URL for the frontend.
 *
 * This mirrors src/lib/db.ts, src/lib/itemsRoute.ts and src/lib/aggregation.ts
 * from the Next.js app, but reading/writing a Google Sheet instead of SQLite.
 */

var SHEET_HEADERS = {
  Settings: ["key", "value"],
  RevenueCurrentYearItems: [
    "id", "organization_name", "category", "item_name",
    "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note", "created_at",
  ],
  RevenueYearlyOverview: [
    "organization_name", "category",
    "forecast_year1", "forecast_year2", "forecast_year3", "responsible", "note",
  ],
  ExpensePersonnelItems: [
    "id", "organization_name", "employee_name", "subcategory", "item_name",
    "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note", "created_at",
  ],
  ExpenseBasicItems: [
    "id", "organization_name", "subcategory", "item_name",
    "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note", "created_at",
  ],
  ExpenseServiceItems: [
    "id", "organization_name", "subcategory", "item_name",
    "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note", "created_at",
  ],
  ExpenseProjectItems: [
    "id", "organization_name", "project_name", "item_name",
    "q1_plan", "q2_plan", "q3_plan", "q4_plan",
    "reason", "expected_output", "responsible", "note", "created_at",
  ],
  ExpenseInvestmentItems: [
    "id", "organization_name", "subcategory", "equipment_type", "item_name",
    "unit", "quantity", "unit_price",
    "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note", "created_at",
  ],
  ExpenseYearlyOverview: [
    "organization_name", "category",
    "forecast_year1", "forecast_year2", "forecast_year3", "responsible", "note",
  ],
  CarryoverItems: [
    "id", "organization_name", "item_name", "committed_amount", "note", "created_at",
  ],
};

// Generic item-list resources, keyed by the same names the frontend uses
// (see src/app/api/*/route.ts folder names).
var RESOURCE_CONFIG = {
  "revenue-items": {
    sheet: "RevenueCurrentYearItems",
    fields: ["category", "item_name", "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note"],
    numericFields: ["q1_plan", "q2_plan", "q3_plan", "q4_plan"],
    hasQuarters: true,
  },
  "expense-personnel": {
    sheet: "ExpensePersonnelItems",
    fields: ["employee_name", "subcategory", "item_name", "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note"],
    numericFields: ["q1_plan", "q2_plan", "q3_plan", "q4_plan"],
    hasQuarters: true,
  },
  "expense-basic": {
    sheet: "ExpenseBasicItems",
    fields: ["subcategory", "item_name", "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note"],
    numericFields: ["q1_plan", "q2_plan", "q3_plan", "q4_plan"],
    hasQuarters: true,
  },
  "expense-service": {
    sheet: "ExpenseServiceItems",
    fields: ["subcategory", "item_name", "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note"],
    numericFields: ["q1_plan", "q2_plan", "q3_plan", "q4_plan"],
    hasQuarters: true,
  },
  "expense-project": {
    sheet: "ExpenseProjectItems",
    fields: [
      "project_name", "item_name", "q1_plan", "q2_plan", "q3_plan", "q4_plan",
      "reason", "expected_output", "responsible", "note",
    ],
    numericFields: ["q1_plan", "q2_plan", "q3_plan", "q4_plan"],
    hasQuarters: true,
  },
  "expense-investment": {
    sheet: "ExpenseInvestmentItems",
    fields: [
      "subcategory", "equipment_type", "item_name", "unit", "quantity", "unit_price",
      "q1_plan", "q2_plan", "q3_plan", "q4_plan", "responsible", "note",
    ],
    numericFields: ["quantity", "unit_price", "q1_plan", "q2_plan", "q3_plan", "q4_plan"],
    hasQuarters: true,
    computeAmount: true,
  },
  carryover: {
    sheet: "CarryoverItems",
    fields: ["item_name", "committed_amount", "note"],
    numericFields: ["committed_amount"],
    hasQuarters: false,
  },
};

var REVENUE_CATEGORIES = ["รายรับจากการให้บริการ", "รายรับอื่นจากการดำเนินงาน", "รายรับอื่นๆ"];
var EXPENSE_OVERVIEW_CATEGORIES = [
  "รายจ่ายบุคลากร",
  "รายจ่ายดำเนินงาน - งานพื้นฐาน",
  "รายจ่ายดำเนินงาน - งานบริการ",
  "รายจ่ายดำเนินงาน - งานโครงการขับเคลื่อน",
  "รายจ่ายลงทุน - ที่ดินและสิ่งก่อสร้าง",
  "รายจ่ายลงทุน - ครุภัณฑ์",
  "รายจ่ายลงทุน - อื่นๆ",
];

// ---------- one-time setup ----------

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEET_HEADERS).forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    var headers = SHEET_HEADERS[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  });

  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getLastRow() <= 1 && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  var settings = ss.getSheetByName("Settings");
  var values = settings.getDataRange().getValues();
  var hasFiscalYear = values.some(function (row, i) { return i > 0 && row[0] === "fiscal_year"; });
  if (!hasFiscalYear) settings.appendRow(["fiscal_year", "2569"]);

  SpreadsheetApp.getUi().alert(
    "ตั้งค่าชีทเรียบร้อย ไปที่ Deploy > New deployment > Web app เพื่อเผยแพร่ต่อได้เลย"
  );
}

// ---------- generic sheet row helpers ----------

function getSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error("Sheet not found: " + name + " — run setupSheets() first.");
  return sheet;
}

function readAllRows_(sheetName) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var raw = values[i];
    var blank = raw.every(function (c) { return c === "" || c === null; });
    if (blank) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = raw[j];
    obj.__row = i + 1;
    rows.push(obj);
  }
  return rows;
}

function appendRow_(sheetName, obj) {
  var sheet = getSheet_(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) { return obj[h] !== undefined ? obj[h] : ""; });
  sheet.appendRow(row);
}

function updateRowByMatch_(sheetName, matchFn, patch) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j];
    if (matchFn(obj)) {
      Object.keys(patch).forEach(function (key) {
        var colIdx = headers.indexOf(key);
        if (colIdx >= 0) sheet.getRange(i + 1, colIdx + 1).setValue(patch[key]);
      });
      return true;
    }
  }
  return false;
}

function deleteRowByMatch_(sheetName, matchFn) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j];
    if (matchFn(obj)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function toPublic_(obj) {
  var copy = {};
  Object.keys(obj).forEach(function (k) {
    if (k !== "__row") copy[k] = obj[k];
  });
  return copy;
}

function withComputed_(obj, cfg) {
  var out = toPublic_(obj);
  if (cfg.hasQuarters) {
    out.total_year =
      Number(obj.q1_plan || 0) + Number(obj.q2_plan || 0) + Number(obj.q3_plan || 0) + Number(obj.q4_plan || 0);
  }
  if (cfg.computeAmount) {
    out.amount = Number(obj.quantity || 0) * Number(obj.unit_price || 0);
  }
  return out;
}

// ---------- generic item CRUD (mirrors src/lib/itemsRoute.ts) ----------

function listResourceItems_(resourceKey, organization) {
  var cfg = RESOURCE_CONFIG[resourceKey];
  var rows = readAllRows_(cfg.sheet);
  var filtered = organization ? rows.filter(function (r) { return r.organization_name === organization; }) : rows;
  return filtered.map(function (r) { return withComputed_(r, cfg); });
}

function createResourceItem_(resourceKey, body) {
  var cfg = RESOURCE_CONFIG[resourceKey];
  var obj = {
    id: Utilities.getUuid(),
    organization_name: body.organization_name || "",
    created_at: new Date().toISOString(),
  };
  cfg.fields.forEach(function (f) {
    var v = body[f];
    obj[f] = cfg.numericFields && cfg.numericFields.indexOf(f) >= 0 ? Number(v || 0) : v == null ? "" : v;
  });
  appendRow_(cfg.sheet, obj);
  return withComputed_(obj, cfg);
}

function updateResourceItem_(resourceKey, id, body) {
  var cfg = RESOURCE_CONFIG[resourceKey];
  var patch = { organization_name: body.organization_name || "" };
  cfg.fields.forEach(function (f) {
    var v = body[f];
    patch[f] = cfg.numericFields && cfg.numericFields.indexOf(f) >= 0 ? Number(v || 0) : v == null ? "" : v;
  });
  updateRowByMatch_(cfg.sheet, function (r) { return r.id === id; }, patch);
  var updated = readAllRows_(cfg.sheet).filter(function (r) { return r.id === id; })[0];
  return withComputed_(updated, cfg);
}

function deleteResourceItem_(resourceKey, id) {
  var cfg = RESOURCE_CONFIG[resourceKey];
  deleteRowByMatch_(cfg.sheet, function (r) { return r.id === id; });
  return { ok: true };
}

// ---------- calculation rules (mirrors src/lib/aggregation.ts) ----------

function sumQuarters_(sheetName, matchFn) {
  var total = 0;
  readAllRows_(sheetName).forEach(function (r) {
    if (matchFn(r)) total += Number(r.q1_plan || 0) + Number(r.q2_plan || 0) + Number(r.q3_plan || 0) + Number(r.q4_plan || 0);
  });
  return total;
}

function revenueYearCurrent_(org, category) {
  return sumQuarters_("RevenueCurrentYearItems", function (r) {
    return r.organization_name === org && r.category === category;
  });
}

function expenseYearCurrent_(org, category) {
  function byOrg(r) { return r.organization_name === org; }
  function byOrgSub(sub) {
    return function (r) { return r.organization_name === org && r.subcategory === sub; };
  }
  switch (category) {
    case "รายจ่ายบุคลากร":
      return sumQuarters_("ExpensePersonnelItems", byOrg);
    case "รายจ่ายดำเนินงาน - งานพื้นฐาน":
      return sumQuarters_("ExpenseBasicItems", byOrg);
    case "รายจ่ายดำเนินงาน - งานบริการ":
      return sumQuarters_("ExpenseServiceItems", byOrg);
    case "รายจ่ายดำเนินงาน - งานโครงการขับเคลื่อน":
      return sumQuarters_("ExpenseProjectItems", byOrg);
    case "รายจ่ายลงทุน - ที่ดินและสิ่งก่อสร้าง":
      return sumQuarters_("ExpenseInvestmentItems", byOrgSub("ที่ดินและสิ่งก่อสร้าง"));
    case "รายจ่ายลงทุน - ครุภัณฑ์":
      return sumQuarters_("ExpenseInvestmentItems", byOrgSub("ครุภัณฑ์"));
    case "รายจ่ายลงทุน - อื่นๆ":
      return sumQuarters_("ExpenseInvestmentItems", byOrgSub("อื่นๆ"));
    default:
      return 0;
  }
}

function getOverviewForecast_(sheetName, org, category) {
  var rows = readAllRows_(sheetName);
  var match = rows.filter(function (r) { return r.organization_name === org && r.category === category; })[0];
  return match || { forecast_year1: 0, forecast_year2: 0, forecast_year3: 0, responsible: "", note: "" };
}

function getRevenueOverview_(org) {
  return REVENUE_CATEGORIES.map(function (category) {
    var f = getOverviewForecast_("RevenueYearlyOverview", org, category);
    return {
      organization_name: org,
      category: category,
      year_current: revenueYearCurrent_(org, category),
      forecast_year1: Number(f.forecast_year1 || 0),
      forecast_year2: Number(f.forecast_year2 || 0),
      forecast_year3: Number(f.forecast_year3 || 0),
      responsible: f.responsible || null,
      note: f.note || null,
    };
  });
}

function getExpenseOverview_(org) {
  return EXPENSE_OVERVIEW_CATEGORIES.map(function (category) {
    var f = getOverviewForecast_("ExpenseYearlyOverview", org, category);
    return {
      organization_name: org,
      category: category,
      year_current: expenseYearCurrent_(org, category),
      forecast_year1: Number(f.forecast_year1 || 0),
      forecast_year2: Number(f.forecast_year2 || 0),
      forecast_year3: Number(f.forecast_year3 || 0),
      responsible: f.responsible || null,
      note: f.note || null,
    };
  });
}

function upsertOverviewForecast_(sheetName, body) {
  var org = body.organization_name, category = body.category;
  var patch = {
    forecast_year1: Number(body.forecast_year1 || 0),
    forecast_year2: Number(body.forecast_year2 || 0),
    forecast_year3: Number(body.forecast_year3 || 0),
    responsible: body.responsible || "",
    note: body.note || "",
  };
  var updated = updateRowByMatch_(sheetName, function (r) {
    return r.organization_name === org && r.category === category;
  }, patch);
  if (!updated) {
    appendRow_(sheetName, Object.assign({ organization_name: org, category: category }, patch));
  }
  return { ok: true };
}

// ---------- dashboards ----------

function getDashboard_(org, fiscalYear) {
  var revenueRows = getRevenueOverview_(org);
  var revenue = revenueRows.map(function (r) { return { category: r.category, amount: r.year_current }; });
  var revenue_total = revenue.reduce(function (s, r) { return s + r.amount; }, 0);

  var expenseRows = getExpenseOverview_(org);
  function findCat(cat) {
    return expenseRows.filter(function (r) { return r.category === cat; })[0].year_current;
  }
  var personnel = findCat("รายจ่ายบุคลากร");
  var operating =
    findCat("รายจ่ายดำเนินงาน - งานพื้นฐาน") +
    findCat("รายจ่ายดำเนินงาน - งานบริการ") +
    findCat("รายจ่ายดำเนินงาน - งานโครงการขับเคลื่อน");
  var investment =
    findCat("รายจ่ายลงทุน - ที่ดินและสิ่งก่อสร้าง") +
    findCat("รายจ่ายลงทุน - ครุภัณฑ์") +
    findCat("รายจ่ายลงทุน - อื่นๆ");

  var expense = [
    { category: "รายจ่ายบุคลากร", amount: personnel },
    { category: "รายจ่ายการดำเนินงาน (งานพื้นฐาน+งานบริการ+โครงการขับเคลื่อน)", amount: operating },
    { category: "รายจ่ายลงทุน (ที่ดินสิ่งก่อสร้าง+ครุภัณฑ์+อื่นๆ)", amount: investment },
  ];
  var expense_total = personnel + operating + investment;

  var carryover = readAllRows_("CarryoverItems")
    .filter(function (r) { return r.organization_name === org; })
    .map(toPublic_);
  var carryover_total = carryover.reduce(function (s, c) { return s + Number(c.committed_amount || 0); }, 0);

  return {
    organization_name: org,
    fiscal_year: fiscalYear,
    revenue: revenue,
    revenue_total: revenue_total,
    expense: expense,
    expense_total: expense_total,
    carryover: carryover,
    carryover_total: carryover_total,
  };
}

function getAllOrganizations_() {
  var sheets = [
    "RevenueCurrentYearItems", "ExpensePersonnelItems", "ExpenseBasicItems",
    "ExpenseServiceItems", "ExpenseProjectItems", "ExpenseInvestmentItems", "CarryoverItems",
  ];
  var set = {};
  sheets.forEach(function (s) {
    readAllRows_(s).forEach(function (r) {
      if (r.organization_name) set[r.organization_name] = true;
    });
  });
  return Object.keys(set).sort();
}

function getMasterDashboard_(fiscalYear) {
  var orgs = getAllOrganizations_();
  var perOrg = orgs.map(function (org) { return getDashboard_(org, fiscalYear); });
  var totalRevenue = perOrg.reduce(function (s, o) { return s + o.revenue_total; }, 0);
  var totalExpense = perOrg.reduce(function (s, o) { return s + o.expense_total; }, 0);
  return { organizations: orgs, perOrg: perOrg, totalRevenue: totalRevenue, totalExpense: totalExpense };
}

// ---------- settings ----------

function getFiscalYear_() {
  var rows = readAllRows_("Settings");
  var row = rows.filter(function (r) { return r.key === "fiscal_year"; })[0];
  return row ? Number(row.value) : 2569;
}

function setFiscalYear_(year) {
  var updated = updateRowByMatch_("Settings", function (r) { return r.key === "fiscal_year"; }, { value: String(year) });
  if (!updated) appendRow_("Settings", { key: "fiscal_year", value: String(year) });
  return { fiscal_year: year };
}

// ---------- HTTP entry points ----------

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var params = e.parameter || {};
  var resource = params.resource;
  var organization = params.organization;
  try {
    var result;
    if (resource === "revenue-overview") result = getRevenueOverview_(organization);
    else if (resource === "expense-overview") result = getExpenseOverview_(organization);
    else if (resource === "dashboard") result = getDashboard_(organization, getFiscalYear_());
    else if (resource === "master-dashboard") result = getMasterDashboard_(getFiscalYear_());
    else if (resource === "settings") result = { fiscal_year: getFiscalYear_() };
    else if (resource === "organizations") result = getAllOrganizations_();
    else if (RESOURCE_CONFIG[resource]) result = listResourceItems_(resource, organization);
    else return jsonResponse_({ error: "unknown resource: " + resource });
    return jsonResponse_(result);
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var resource = body.resource;
    var action = body.action;
    var result;

    if (resource === "revenue-overview" && action === "update") {
      result = upsertOverviewForecast_("RevenueYearlyOverview", body);
    } else if (resource === "expense-overview" && action === "update") {
      result = upsertOverviewForecast_("ExpenseYearlyOverview", body);
    } else if (resource === "settings" && action === "update") {
      result = setFiscalYear_(Number(body.fiscal_year));
    } else if (RESOURCE_CONFIG[resource]) {
      if (action === "create") result = createResourceItem_(resource, body);
      else if (action === "update") result = updateResourceItem_(resource, body.id, body);
      else if (action === "delete") result = deleteResourceItem_(resource, body.id);
      else return jsonResponse_({ error: "unknown action: " + action });
    } else {
      return jsonResponse_({ error: "unknown resource: " + resource });
    }
    return jsonResponse_(result);
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}
