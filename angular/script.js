var Currency = (function () {
    function Currency() {
    }
    return Currency;
})();
function downloadCurrenciesXML() {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open("get", "/getCurrencies", true);
        request.onload = function (e) {
            resolve(request.responseXML);
        };
        request.send();
    });
}
function findCurrency(xml, name) {
    var currency = new Currency();
    var currencyNode = getFirstXMLNode(xml, "tabela_kursow/pozycja[nazwa_waluty='" + name + "']");
    currency.Rate = parseFloat(getFirstXMLNode(currencyNode, "kurs_sredni/text()").data.replace(",", "."));
    return currency;
}
function getFirstXMLNode(xml, xpath) {
    return document["evaluate"](xpath, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
var app = angular.module("app", []);
app.controller("ProductsController", function ($scope) {
    function initCurrency() {
        var initCurrency = new Currency();
        initCurrency.Rate = 0;
        return initCurrency;
    }
    $scope.zlotysCurrency = new Currency();
    $scope.zlotysCurrency.Rate = 1;
    $scope.dollarCurrency = initCurrency();
    $scope.euroCurrency = initCurrency();
    $scope.poundCurrency = initCurrency();
    $scope.currencies = [
        { label: "zł", value: 1, get: function () {
            return $scope.zlotysCurrency;
        } },
        { label: "$", value: 2, get: function () {
            return $scope.dollarCurrency;
        } },
        { label: "€", value: 3, get: function () {
            return $scope.euroCurrency;
        } },
        { label: "£", value: 4, get: function () {
            return $scope.poundCurrency;
        } }
    ];
    $scope.products = [{
        Price: 12,
        Currency: $scope.currencies[2],
        Quantity: 3
    }];
    $scope.newProduct = {
        CurrencyType: $scope.currencies[0]
    };
    $scope.addProduct = function () {
        $scope.products.push({
            Price: $scope.newProduct.Price,
            Currency: $scope.newProduct.Currency,
            Quantity: $scope.newProduct.Quantity
        });
    };
    $scope.$watch(function () {
        var sum = 0;
        for (var i = 0; i < $scope.products.length; i++) {
            var product = $scope.products[i];
            sum += product.Price * product.Currency.get().Rate * product.Quantity;
        }
        console.log(sum);
        return sum;
    }, function (newValue, oldValue) {
        $scope.sum = newValue;
    });
    $scope.sum = 3;
    downloadCurrenciesXML().then(function (xml) {
        $scope.$apply(function () {
            $scope.dollarCurrency.Rate = findCurrency(xml, "dolar amerykański").Rate;
            $scope.euroCurrency.Rate = findCurrency(xml, "euro").Rate;
            $scope.poundCurrency.Rate = findCurrency(xml, "funt szterling").Rate;
        });
    });
});
