"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var XLSX = require("xlsx");
var lucide_react_1 = require("lucide-react");
var Header_1 = require("@/components/Header");
var Dashboard_1 = require("@/components/Dashboard");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var useRequests_1 = require("@/hooks/useRequests");
var types_1 = require("@/types");
var sonner_1 = require("sonner");
var react_router_dom_1 = require("react-router-dom");
var Admin = function () {
    var _a, _b;
    var _c = (0, useRequests_1.useRequests)(), _d = _c.data, requests = _d === void 0 ? [] : _d, isLoading = _c.isLoading;
    var _e = (0, react_1.useState)(function () {
        return localStorage.getItem('admin:authenticated') === 'true';
    }), isAuthenticated = _e[0], setIsAuthenticated = _e[1];
    // Always show login page when navigating to Admin Dashboard
    (0, react_1.useEffect)(function () {
        localStorage.removeItem('admin:authenticated');
        setIsAuthenticated(false);
    }, []);
    var _f = (0, react_1.useState)(''), username = _f[0], setUsername = _f[1];
    var _g = (0, react_1.useState)(''), password = _g[0], setPassword = _g[1];
    var _h = (0, react_1.useState)(false), showPassword = _h[0], setShowPassword = _h[1];
    var _j = (0, react_1.useState)(function () { return (0, date_fns_1.format)(new Date(), 'yyyy-MM'); }), selectedMonth = _j[0], setSelectedMonth = _j[1];
    var _k = (0, react_1.useState)(''), searchQuery = _k[0], setSearchQuery = _k[1];
    var adminUsername = (_a = import.meta.env.VITE_ADMIN_USERNAME) !== null && _a !== void 0 ? _a : 'multimediabugemco';
    var adminPassword = (_b = import.meta.env.VITE_ADMIN_PASSWORD) !== null && _b !== void 0 ? _b : 'multimediabugemco@2025';
    var exportRows = (0, react_1.useMemo)(function () {
        var _a = selectedMonth.split('-').map(Number), year = _a[0], month = _a[1];
        var interval = {
            start: (0, date_fns_1.startOfMonth)(new Date(year, month - 1)),
            end: (0, date_fns_1.endOfMonth)(new Date(year, month - 1)),
        };
        return requests
            .filter(function (request) {
            var requestedDate = new Date(request.date_requested);
            return (0, date_fns_1.isWithinInterval)(requestedDate, interval);
        })
            .map(function (request) {
            var _a, _b;
            return ({
                'Task ID': request.task_id,
                'Requester Name': request.employee.full_name,
                'Employee ID': request.employee.employee_id,
                'Branch / Department': request.employee.branch,
                Email: (_a = request.employee.email) !== null && _a !== void 0 ? _a : '',
                'Task Type': types_1.TASK_TYPE_LABELS[request.task_type],
                Description: request.task_description,
                'Date Requested': (0, date_fns_1.format)(new Date(request.date_requested), 'yyyy-MM-dd'),
                Deadline: (0, date_fns_1.format)(new Date(request.target_completion_date), 'yyyy-MM-dd'),
                Status: types_1.STATUS_LABELS[request.status],
                Notes: (_b = request.notes) !== null && _b !== void 0 ? _b : '',
            });
        });
    }, [requests, selectedMonth]);
    var handleExport = function () {
        if (isLoading) {
            sonner_1.toast.info('Loading requests. Please try again in a moment.');
            return;
        }
        if (!isAuthenticated) {
            sonner_1.toast.error('Please log in to download reports.');
            return;
        }
        if (exportRows.length === 0) {
            sonner_1.toast.warning('No requests available to export.');
            return;
        }
        var worksheet = XLSX.utils.json_to_sheet(exportRows);
        var csv = XLSX.utils.sheet_to_csv(worksheet);
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var monthLabel = (0, date_fns_1.format)(new Date("".concat(selectedMonth, "-01")), 'yyyy-MM');
        var fileName = "Multimedia Request Report Form-".concat(monthLabel, ".csv");
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };
    var handleLogin = function (event) {
        event.preventDefault();
        if (username === adminUsername && password === adminPassword) {
            localStorage.setItem('admin:authenticated', 'true');
            setIsAuthenticated(true);
            setUsername('');
            setPassword('');
            sonner_1.toast.success('Logged in successfully.');
        }
        else {
            sonner_1.toast.error('Invalid username or password.');
        }
    };
    var handleLogout = function () {
        localStorage.removeItem('admin:authenticated');
        setIsAuthenticated(false);
        sonner_1.toast.success('Logged out.');
    };
    return (<div className="min-h-screen bg-background">
      <Header_1.Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end mb-6">
          {isAuthenticated ? (<div className="flex flex-wrap gap-2 justify-end w-full items-center">
              <label_1.Label htmlFor="export-month" className="shrink-0">
                Export month
              </label_1.Label>
              <input_1.Input id="export-month" type="month" value={selectedMonth} onChange={function (event) { return setSelectedMonth(event.target.value); }} className="w-[180px]"/>
              <button_1.Button onClick={handleExport} className="gap-2" disabled={isLoading}>
                <lucide_react_1.Download className="h-4 w-4"/>
                Download CSV Report
              </button_1.Button>
              <button_1.Button variant="outline" onClick={handleLogout}>
                Log out
              </button_1.Button>
            </div>) : null}
        </div>

        {!isAuthenticated ? (<div className="mx-auto max-w-md">
            <card_1.Card className="shadow-card">
              <card_1.CardHeader>
                <card_1.CardTitle className="font-display text-xl">Admin Login</card_1.CardTitle>
                <card_1.CardDescription>Enter your admin credentials to continue.</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label_1.Label htmlFor="admin-username">Username</label_1.Label>
                    <input_1.Input id="admin-username" autoComplete="username" value={username} onChange={function (event) { return setUsername(event.target.value); }} placeholder="Enter username"/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label htmlFor="admin-password">Password</label_1.Label>
                    <input_1.Input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={function (event) { return setPassword(event.target.value); }} placeholder="Enter password"/>
                    <div className="flex items-center gap-2">
                      <checkbox_1.Checkbox id="admin-show-password" checked={showPassword} onCheckedChange={function (checked) { return setShowPassword(Boolean(checked)); }}/>
                      <label_1.Label htmlFor="admin-show-password" className="text-sm text-muted-foreground">
                        Show password
                      </label_1.Label>
                    </div>
                  </div>
                  <button_1.Button type="submit" className="w-full">
                    Log in
                  </button_1.Button>
                </form>
                <div className="mt-4">
                  <button_1.Button asChild variant="ghost" className="w-full hover:bg-[#ffd800] hover:text-[#006633]">
                    <react_router_dom_1.Link to="/">Back</react_router_dom_1.Link>
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>) : (<>
            <div className="mb-4">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <input_1.Input placeholder="Search by task ID, requester name, or description..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="pl-9"/>
              </div>
            </div>
            <Dashboard_1.Dashboard requests={requests.filter(function (request) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                var query = searchQuery.trim().toLowerCase();
                if (!query)
                    return true;
                var taskId = (_b = (_a = request.task_id) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
                var requester = (_e = (_d = (_c = request.employee) === null || _c === void 0 ? void 0 : _c.full_name) === null || _d === void 0 ? void 0 : _d.toLowerCase()) !== null && _e !== void 0 ? _e : '';
                var description = (_g = (_f = request.task_description) === null || _f === void 0 ? void 0 : _f.toLowerCase()) !== null && _g !== void 0 ? _g : '';
                var branch = (_k = (_j = (_h = request.employee) === null || _h === void 0 ? void 0 : _h.branch) === null || _j === void 0 ? void 0 : _j.toLowerCase()) !== null && _k !== void 0 ? _k : '';
                var taskType = (_m = (_l = types_1.TASK_TYPE_LABELS[request.task_type]) === null || _l === void 0 ? void 0 : _l.toLowerCase()) !== null && _m !== void 0 ? _m : '';
                return (taskId.includes(query) ||
                    requester.includes(query) ||
                    description.includes(query) ||
                    branch.includes(query) ||
                    taskType.includes(query));
            })} isLoading={isLoading} hideNewRequestButton/>
          </>)}
      </main>
    </div>);
};
exports.default = Admin;
