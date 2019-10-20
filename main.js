const electron = require('electron');
const express = require('express');

const {app, BrowserWindow} = electron;

let mainWindow;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true
    });
    mainWindow.loadURL('http://localhost:3000/login');
    mainWindow.focus();
});