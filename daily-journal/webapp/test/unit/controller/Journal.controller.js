/*global QUnit*/

sap.ui.define([
    "com/dailyjournal/dailyjournal/controller/Journal.controller"
], function (Controller) {
    "use strict";

    QUnit.module("Journal Controller");

    QUnit.test("summarizes and filters journal entries on initialization", function (assert) {
        const oData = {
            entries: [
                {
                    id: "1",
                    title: "A quiet morning",
                    text: "Coffee and sunlight.",
                    date: "2024-06-01",
                    mood: "good"
                },
                {
                    id: "2",
                    title: "An evening walk",
                    text: "A little fresh air.",
                    date: "2024-06-02",
                    mood: "great"
                }
            ],
            searchQuery: "coffee",
            moodFilter: "all"
        };
        const oModel = {
            getProperty(sPath) {
                return oData[sPath.slice(1)];
            },
            setProperty(sPath, vValue) {
                oData[sPath.slice(1)] = vValue;
            }
        };
        const oBundle = {
            getText(sKey, aParameters) {
                return aParameters ? aParameters.join(" ") : sKey;
            }
        };
        const oController = new Controller();

        oController.getOwnerComponent = function () {
            return {
                getModel(sName) {
                    return sName === "journal" ? oModel : { getResourceBundle: () => oBundle };
                }
            };
        };
        oController.getView = function () {
            return { getModel: () => ({ getResourceBundle: () => oBundle }) };
        };
        oController.onInit();

        assert.strictEqual(oData.entryCount, 2, "counts all journal entries");
        assert.strictEqual(oData.wordCount, 7, "counts all words");
        assert.strictEqual(oData.filteredEntries.length, 1, "filters entries by their text");
        assert.strictEqual(oData.filteredEntries[0].id, "1", "keeps the matching entry");
    });
});
