'use strict';

/* Controllers */
var mod = angular.module('orderApp.controllers', []);

function AppModel() {
	this.data = {
		
	};
	
	this.cache = function() {
		
	}
}

function OrderModel() {
	this.data = {
		orderlist:{}
	}
}

mod.factory('appModel', function() {
	return new AppModel();
});

mod.factory('orderModel', function() {
	return new OrderModel();
});

mod.factory('ws', function() {
	return new AutobahnWebSocket();
}); 

mod.controller('NavigationController', function($scope, $location) {
	
});

mod.controller('StartController', function($scope, $location, appModel) {
	appModel.data.path = "cupsbandung.json";
	$scope.onClickStart = function() {
		$location.path('/initialize');
	}
});

mod.controller('InitializeController', function($scope, $http, $location, appModel, ws) {
	
	var _this = this;
	
	$scope.status = "";
	
	this.loadAppData = function() {
		$scope.status = "Loading application data";
		//$http.get( "http://192.168.2.4/moframe/platforms/android/assets/www/cupsbandung.json" ).success(function(data) {
		$http.get( "http://192.168.2.4/socian_venues/herbertzstuttgart/data.json").success(function(data) {
		//$http.get( appModel.data.path ).success(function(data) {
			appModel.data.location = data.location;
			appModel.data.menu = data.menu;
			appModel.data.config = data.config;
			
			/*
			if(confirm('Please confirm this location: ' + appModel.data.location.name)) {
				_this.checkInternetConnection();	
			}
			else $location.path('/scan');
			*/
			
			_this.checkInternetConnection();	
		});
		
	}
	
	// if the wifiCheck is set true check the internet connection
	this.checkInternetConnection = function() {
		$scope.status = "Checking internet connection";
		if(appModel.data.config['wificheck'] == "true") {
			// check the internet connection	
			
			var networkState = navigator.network.connection.type;
			if(networkState != Connection.WIFI) {
				alert('You need to connect to the location WIFI');
				
				// dev only
				_this.createWSConnection();
			}
			else _this.createWSConnection();
		}
		else _this.createWSConnection();
	}
	
	this.createWSConnection = function() {
		$scope.status = "Create the web socket connection";
		ws.onopen = function() {
			$scope.$apply(function() {
				$location.path('/order');	
			})
		}
		
		ws.onerror = function(err) {
			alert(err);
			$scope.$apply(function() {
				$location.path('/start');
			});
		}
		
		var host = appModel.data.config['wshost'];
		ws.connect(host);
	}
	
	// start the controller
	this.loadAppData();
});

mod.controller('OrderController', function($scope, $location, appModel, orderModel, ws) {
	
	var _this = this;
	
	// register staff
	ws.send(JSON.stringify( {command:'REGISTER_STAFF', data:null} ));
	
	// get the orders
	ws.send(JSON.stringify( {command:'GET_ORDER_LIST', data:{}} ));
	
	$scope.setOrderStatusReady = function(index) {
		var order = orderModel.data.orderlist[index];
		var oid = order.orderid;
		
		var msg = {command:'UPDATE_ORDER_STATUS_READY', data:{orderid:oid}}
		ws.send(JSON.stringify(msg));
	}
	
	$scope.setOrderStatusComplete = function(index) {
		if(! confirm('complete the order ?')) return;
		var order = orderModel.data.orderlist[index];
		var oid = order.orderid;
		
		var msg = {command:'UPDATE_ORDER_STATUS_COMPLETE', data:{orderid:oid}}
		ws.send(JSON.stringify(msg));
	}
	
	//--------------------//
	// web socket
	//--------------------//
	
	this.handler = {
		'ORDER_UPDATE' : function( data ) {	
			orderModel.data.orderlist = data;
			$scope.$apply(function() {
				$scope.orders = orderModel.data.orderlist;
			});
		}
	}
	
	ws.onmessage = function(message) {
		var msg = angular.fromJson(message);
		var handler = _this.handler[msg.command];
		if(handler != null) {
			handler.apply(handler, [msg.data]);
		}
	}
	
	ws.onerror = function(err) {
		alert("WSERROR: " + err);
		$scope.$apply(function() {
			$location.path('/scan');
		});
	}
});
