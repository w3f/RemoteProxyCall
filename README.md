# Remote Proxy Transaction Tool

A simple UI that implements the instructions within [Remote Proxies for the Brave](https://blog.kchr.de/polkadot/guides/remote-proxies-for-the-braves/) guide.

The code as is works for transferring all the balance from pure proxy accounts created on Kusama relay chain that have account balance on Kusama Asset Hub.
As Pure Proxies do not have known private key, it is not possible to sign and submit balance transfer transactions on Kusama Asset Hub. Hence, if we can prove
to Kusama Asset Hub that there exists a pure proxy setup on relaychain, it allows you to make proxy calls taking the relay chain setup proof as an authorization.
This is purely Polkadot crosschain magic in action!

## Run Locally

Assuming you have `npm` installed, use the following commands to run the website locally at `http://localhost:8080/` 

```
npm install @polkadot/api
```
```
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin
```
```
npm run start
```

Enter the relay chain account and its pure proxy details and generate proxy call

<img width="720" alt="Screenshot 2025-04-11 at 15 59 06" src="https://github.com/user-attachments/assets/0c2dfdb3-2d01-48bf-8009-6bc92b5048dd" />

Copy the hex encoded call to Polkadot JS UI Extrinsics decode tab. Sign and submit the transaction from the account on Kusama Asset Hub.
