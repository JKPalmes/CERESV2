
function setupAccountInfo() {
    var accountInfo = JSON.parse(sessionStorage.getItem('accountInfo')).filter(c => c.ClientID == 1)[0];
    // widget configuration
    var config = {
        layout: {
            name: 'layout',
            padding: 4,
            panels: [
                { type: 'left', size: '50%', resizable: true, minSize: 300 },
                { type: 'main', minSize: 300 }
            ]
        },
        grid: {
            name: 'grid',
            show: {
                toolbar: true,
                toolbarDelete: true
            },
            columns: [
                { field: 'AccountName', caption: 'Account Name', size: '33%', sortable: true, searchable: true },
                { field: 'AccountOwner', caption: 'Account Owner', size: '33%', sortable: true, searchable: true },
                { field: 'Email', caption: 'Email', size: '33%' },
                { field: 'PhoneNumber', caption: 'Phone', size: '120px', render: 'number' }
            ],
            //records: [
            //    { recid: 1, fname: 'John', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 2, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 3, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 4, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 5, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 6, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 7, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 8, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 9, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' }
            //],
            records: accountInfo,
            onClick: function (event) {
                var grid = this;
                var form = w2ui.form;
                console.log(event);
                event.onComplete = function () {
                    var sel = grid.getSelection();
                    console.log(sel);
                    if (sel.length == 1) {
                        form.clientID = sel[0];
                        form.record = $.extend(true, {}, grid.get(sel[0]));
                        form.refresh();
                    } else {
                        form.clear();
                    }
                }
            }
        },
        form: {
            header: 'Edit Record',
            name: 'form',
            fields: [
                { field: 'ClientID', type: 'text', html: { text: 'ID', attr: 'size="10" readonly' } },
                { field: 'AccountName', type: 'text', required: true, html: { text: 'Account Name', attr: 'size="40" maxlength="40"' } },
                { field: 'AccountOwner', type: 'text', required: true, html: { text: 'Account Owner', attr: 'size="40" maxlength="40"' } },
                { field: 'Email', type: 'email', html: { text: 'Email', attr: 'size="30"' } },
                { field: 'PhoneNumber', type: 'number', html: { text: 'Phone', attr: 'size="10"' } }
            ],
            actions: {
                Reset: function () {
                    this.clear();
                },
                Save: function () {
                    var errors = this.validate();
                    if (errors.length > 0) return;
                    if (this.ClientID == 0) {
                        w2ui.grid.add($.extend(true, this.record, { clientID: w2ui.grid.records.length + 2 }));
                        w2ui.grid.selectNone();
                        this.clear();
                    } else {
                        w2ui.grid.set(this.clientID, this.record);
                        w2ui.grid.selectNone();
                        this.clear();
                    }
                }
            }
        }
    };

    $(function () {
        // initialization
        $('#main').w2layout(config.layout);
        w2ui.layout.html('left', $().w2grid(config.grid));
        w2ui.layout.html('main', $().w2form(config.form));
    });
}