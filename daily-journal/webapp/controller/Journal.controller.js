sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Button",
    "sap/m/DatePicker",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Select",
    "sap/m/TextArea",
    "sap/ui/core/Item"
], function () {
    "use strict";

    const [Controller, Button, DatePicker, Dialog, Input, Label, MessageBox, MessageToast, Select, TextArea, Item] = arguments;

    const MOODS = {
        great: { state: "Success", icon: "sap-icon://favorite" },
        good: { state: "Success", icon: "sap-icon://accept" },
        okay: { state: "Information", icon: "sap-icon://circle-task" },
        low: { state: "Warning", icon: "sap-icon://less" },
        tough: { state: "Error", icon: "sap-icon://decline" }
    };

    function toIsoDate(oDate) {
        return [
            oDate.getFullYear(),
            String(oDate.getMonth() + 1).padStart(2, "0"),
            String(oDate.getDate()).padStart(2, "0")
        ].join("-");
    }

    function formatEntryDate(sDate) {
        const oDate = new Date(`${sDate}T12:00:00`);
        return new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }).format(oDate);
    }

    return Controller.extend("com.dailyjournal.dailyjournal.controller.Journal", {
        onInit() {
            this._oJournalModel = this.getOwnerComponent().getModel("journal");
            this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this._updateViewModel();
        },

        onNewEntry() {
            this._openEntryDialog();
        },

        onEditEntry(oEvent) {
            const oEntry = oEvent.getSource().getBindingContext("journal").getObject();
            this._openEntryDialog(oEntry);
        },

        onSaveEntry() {
            const sTitle = this._oTitleInput.getValue().trim();
            const sText = this._oTextArea.getValue().trim();
            const oDate = this._oDatePicker.getDateValue();
            const sMood = this._oMoodSelect.getSelectedKey();

            if (!sTitle || !sText || !oDate) {
                MessageToast.show(this._oResourceBundle.getText("requiredFields"));
                return;
            }

            const aEntries = this._oJournalModel.getProperty("/entries").slice();
            const oEntry = {
                id: this._sEditingEntryId || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
                title: sTitle,
                text: sText,
                date: toIsoDate(oDate),
                mood: sMood
            };
            const iEntryIndex = aEntries.findIndex((oExistingEntry) => oExistingEntry.id === oEntry.id);

            if (iEntryIndex === -1) {
                aEntries.push(oEntry);
            } else {
                aEntries[iEntryIndex] = oEntry;
            }

            this._oJournalModel.setProperty("/entries", aEntries);
            this._updateViewModel();
            this._oEntryDialog.close();
            MessageToast.show(this._oResourceBundle.getText("savedMessage"));
        },

        onCancelEntry() {
            this._oEntryDialog.close();
        },

        onDeleteEntry(oEvent) {
            const oEntry = oEvent.getSource().getBindingContext("journal").getObject();
            const oBundle = this._oResourceBundle;

            MessageBox.confirm(oBundle.getText("deleteConfirmation", [oEntry.title]), {
                title: oBundle.getText("deleteEntry"),
                actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.DELETE,
                onClose: (sAction) => {
                    if (sAction !== MessageBox.Action.DELETE) {
                        return;
                    }

                    const aEntries = this._oJournalModel.getProperty("/entries")
                        .filter((oExistingEntry) => oExistingEntry.id !== oEntry.id);
                    this._oJournalModel.setProperty("/entries", aEntries);
                    this._updateViewModel();
                    MessageToast.show(oBundle.getText("deletedMessage"));
                }
            });
        },

        onSearch(oEvent) {
            this._oJournalModel.setProperty("/searchQuery", oEvent.getParameter("newValue") || "");
            this._updateViewModel();
        },

        onMoodFilterChange(oEvent) {
            this._oJournalModel.setProperty("/moodFilter", oEvent.getSource().getSelectedKey());
            this._updateViewModel();
        },

        _openEntryDialog(oEntry) {
            this._sEditingEntryId = oEntry ? oEntry.id : null;
            const oBundle = this._oResourceBundle;

            if (!this._oEntryDialog) {
                this._oTitleInput = new Input(this.createId("entryTitleInput"), {
                    maxLength: 100,
                    placeholder: oBundle.getText("titlePlaceholder")
                });
                this._oDatePicker = new DatePicker(this.createId("entryDatePicker"), {
                    displayFormat: "long",
                    valueFormat: "yyyy-MM-dd",
                    maxDate: new Date(),
                    width: "100%"
                });
                this._oMoodSelect = new Select(this.createId("entryMoodSelect"), {
                    width: "100%",
                    items: Object.keys(MOODS).map((sMood) => new Item({
                        key: sMood,
                        text: oBundle.getText(`mood${sMood[0].toUpperCase()}${sMood.slice(1)}`)
                    }))
                });
                this._oTextArea = new TextArea(this.createId("entryTextArea"), {
                    rows: 8,
                    growing: true,
                    growingMaxLines: 14,
                    maxLength: 5000,
                    placeholder: oBundle.getText("textPlaceholder"),
                    width: "100%"
                });
                this._oEntryDialog = new Dialog(this.createId("entryDialog"), {
                    contentWidth: "32rem",
                    title: oBundle.getText("newEntry"),
                    content: [
                        new Label({ text: oBundle.getText("entryTitle"), required: true, labelFor: this._oTitleInput.getId() }),
                        this._oTitleInput,
                        new Label({ text: oBundle.getText("entryDate"), required: true, labelFor: this._oDatePicker.getId() }),
                        this._oDatePicker,
                        new Label({ text: oBundle.getText("entryMood"), labelFor: this._oMoodSelect.getId() }),
                        this._oMoodSelect,
                        new Label({ text: oBundle.getText("entryText"), required: true, labelFor: this._oTextArea.getId() }),
                        this._oTextArea
                    ],
                    beginButton: new Button({
                        text: oBundle.getText("saveEntry"),
                        type: "Emphasized",
                        press: this.onSaveEntry.bind(this)
                    }),
                    endButton: new Button({
                        text: oBundle.getText("cancel"),
                        press: this.onCancelEntry.bind(this)
                    }),
                    afterClose: () => {
                        this._sEditingEntryId = null;
                    }
                });
                this.getView().addDependent(this._oEntryDialog);
            }

            this._oEntryDialog.setTitle(oEntry ? oBundle.getText("editEntry") : oBundle.getText("newEntry"));
            this._oDatePicker.setMaxDate(new Date());
            this._oTitleInput.setValue(oEntry ? oEntry.title : "");
            this._oDatePicker.setValue(oEntry ? oEntry.date : toIsoDate(new Date()));
            this._oMoodSelect.setSelectedKey(oEntry ? oEntry.mood : "good");
            this._oTextArea.setValue(oEntry ? oEntry.text : "");
            this._oEntryDialog.open();
        },

        _updateViewModel() {
            const aEntries = this._oJournalModel.getProperty("/entries");
            const sQuery = this._oJournalModel.getProperty("/searchQuery").trim().toLocaleLowerCase();
            const sMoodFilter = this._oJournalModel.getProperty("/moodFilter");
            const aFilteredEntries = aEntries
                .filter((oEntry) => sMoodFilter === "all" || oEntry.mood === sMoodFilter)
                .filter((oEntry) => !sQuery || `${oEntry.title} ${oEntry.text}`.toLocaleLowerCase().includes(sQuery))
                .sort((oFirst, oSecond) => oSecond.date.localeCompare(oFirst.date))
                .map((oEntry) => {
                    const oDate = new Date(`${oEntry.date}T12:00:00`);
                    const oMood = MOODS[oEntry.mood];
                    return {
                        ...oEntry,
                        displayDate: formatEntryDate(oEntry.date),
                        dayNumber: String(oDate.getDate()),
                        monthLabel: new Intl.DateTimeFormat(undefined, { month: "short" }).format(oDate),
                        moodLabel: this._oResourceBundle.getText(
                            `mood${oEntry.mood[0].toUpperCase()}${oEntry.mood.slice(1)}`
                        ),
                        moodState: oMood.state,
                        moodIcon: oMood.icon
                    };
                });
            const oToday = new Date();
            const oBundle = this._oResourceBundle;

            this._oJournalModel.setProperty("/filteredEntries", aFilteredEntries);
            this._oJournalModel.setProperty("/entryCount", aEntries.length);
            this._oJournalModel.setProperty("/wordCount", aEntries.reduce((iTotal, oEntry) => (
                iTotal + oEntry.text.split(/\s+/).filter(Boolean).length
            ), 0));
            this._oJournalModel.setProperty("/todayLabel", new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric"
            }).format(oToday));
            this._oJournalModel.setProperty("/todayShortLabel", oBundle.getText("dateFormatShort", [
                new Intl.DateTimeFormat(undefined, { month: "short" }).format(oToday),
                oToday.getDate(),
                oToday.getFullYear()
            ]));
        }
    });
});
