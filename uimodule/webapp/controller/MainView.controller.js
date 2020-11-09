sap.ui.define([
  "demo/valuehelp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/ColumnListItem",
	"sap/m/Label",
  "sap/m/Token",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"  
], function(Controller, JSONModel, ColumnListItem, Label, Token, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("demo.valuehelp.controller.MainView", {
		onInit: function () {
			this._oMultiInput = this.getView().byId("multiInput");
			this._oMultiInput.setTokens(this._getDefaultTokens());

			this.oColModel = new JSONModel({
        "cols": [
          {
            "label": "ProductId",
            "template": "ProductID",
            "width": "5rem"
          },
          {
            "label": "Product Name",
            "template": "ProductName"
          },
          {
            "label": "Category",
            "template": "CategoryID"
          }
        ]
      });
			this.oProductsModel = this.getOwnerComponent().getModel();
    },

		onValueHelpRequested: function() {
			var aCols = this.oColModel.getData().cols;

			this._oValueHelpDialog = sap.ui.xmlfragment("demo.valuehelp.fragment.ValueHelpDialogBasic", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oProductsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/Products");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/Products", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({ text: "{" + column.template + "}" });
							})
						});
					});
				}
				this._oValueHelpDialog.update();
			}.bind(this));

			this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			this._oValueHelpDialog.open();
    },   
    
		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput.setTokens(aTokens);
			this._oValueHelpDialog.close();
    },    
    
		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
    },
    
		onFilterBarSearch: function (oEvent) {
			var aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			// aFilters.push(new Filter({
			// 	filters: [
			// 		new Filter({ path: "ProductID", operator: FilterOperator.Contains, value1: sSearchQuery }),
			// 		new Filter({ path: "ProductName", operator: FilterOperator.Contains, value1: sSearchQuery }),
			// 		new Filter({ path: "CategoryID", operator: FilterOperator.Contains, value1: sSearchQuery })
			// 	],
			// 	and: false
			// }));

			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
    },   
    
		_filterTable: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		},    
    
		_getDefaultTokens: function () {
			var oToken = new Token({
				key: 1,
				text: "Chai (1)"
			});
			return [oToken];
		}    


  });
});
