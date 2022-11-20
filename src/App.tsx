import { useCallback, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import SocialLogin from "@biconomy-sdk/web3-auth";
import { ethers, providers } from 'ethers'

type StateType = {
  web3Provider?: ethers.providers.Web3Provider | null;
  address?: string;
  chainId?: number;
};
const initialState: StateType = {
  web3Provider: null,
  address: "",
  chainId: 5,
};


function App() {
  const [count, setCount] = useState(0)
  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin>()
  const [web3State, setWeb3State] = useState<StateType>(initialState)

  useEffect(() => {
    const init = async () => {
      const socialLoginSDK = new SocialLogin();
      await socialLoginSDK.init('0x5')
      socialLoginSDK.showConnectModal()
      setSocialLoginSDK(socialLoginSDK)
    }
    if (!socialLoginSDK) init();
  }, []);

  useEffect(() => {
    if (web3State.address && socialLoginSDK) {
      socialLoginSDK.hideWallet()
    }
  }, [web3State])

  const handleLogin = async () => {
    if (socialLoginSDK) {
      socialLoginSDK.showWallet();

      if (socialLoginSDK.provider) {
        const web3Provider = new ethers.providers.Web3Provider(
          socialLoginSDK.provider
        );

        const signer = web3Provider.getSigner()
        const gotAccount = await signer.getAddress();
        const balance = await web3Provider.getBalance(gotAccount)
        const network = await web3Provider.getNetwork();
        setWeb3State({
          ...web3State,
          web3Provider,
          address: gotAccount,
          chainId: Number(network.chainId),
        })
        console.log('web3Provider', { web3Provider, gotAccount, balance })
      }
    }
  }

  useEffect(() => {

    console.log({ socialLoginSDK, web3State }, socialLoginSDK?.provider);
    (async () => {
      if (socialLoginSDK?.provider && !web3State?.address) {
        console.log('handleLogin ======>')
        handleLogin();
      }
    })();
  }, [web3State, socialLoginSDK]);

  // after metamask login -> get provider event
  useEffect(() => {
    const { address } = web3State
    const interval = setInterval(async () => {
      if (address) {
        clearInterval(interval);
      }
      if (socialLoginSDK?.provider && !address) {
        handleLogin();
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [web3State, socialLoginSDK]);

  const disconnect = useCallback(async () => {
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error("Web3Modal not initialized.");
      return;
    }
    await socialLoginSDK.logout();
    setWeb3State(initialState);
    socialLoginSDK.hideWallet();
  }, [socialLoginSDK]);

  return (
    <div className="App">
      <div className="card">
        {web3State?.address ?
          <div>
            <p>
              Connected to: {web3State.address}
            </p>

            <button onClick={disconnect}>
              Logout
            </button>
          </div>
          : <button onClick={handleLogin}>
            Login using Biconomy
          </button>}
      </div>
    </div>
  )
}

export default App
