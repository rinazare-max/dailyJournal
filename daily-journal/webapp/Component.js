sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/dailyjournal/dailyjournal/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.dailyjournal.dailyjournal.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(models.createJournalModel(), "journal");

            // enable routing
            this.getRouter().initialize();
        }
    });
});