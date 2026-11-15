sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        createJournalModel: function () {
            return new JSONModel({
                entries: [],
                filteredEntries: [],
                searchQuery: "",
                moodFilter: "all",
                entryCount: 0,
                wordCount: 0,
                todayLabel: "",
                todayShortLabel: ""
            });
        },

        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        }
    };

});