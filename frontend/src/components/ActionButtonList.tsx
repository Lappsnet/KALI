import { useEffect } from 'react';
import { useDisconnect, useAppKit, useAppKitNetwork, useAppKitAccount  } from '@reown/appkit/react'
import { parseGwei, type Address } from 'viem'
import { useEstimateGas, useSendTransaction, useSignMessage, useBalance } from 'wagmi'
import { pharos } from '../config';

// test transaction
const TEST_TX = {
  to: "0x251d8803f71a8402dD96893E0709588e99F6267c" as Address,
  value: parseGwei('0.0001')
}

interface ActionButtonListProps {
  sendHash: (hash: `0x${string}` ) => void;
  sendSignMsg: (hash: string) => void;
  sendBalance: (balance: string) => void;
}

export const ActionButtonList = ({ sendHash, sendSignMsg, sendBalance }: ActionButtonListProps) => {
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const { switchNetwork } = useAppKitNetwork();
    const { address, isConnected } = useAppKitAccount()

    const { data: gas } = useEstimateGas({...TEST_TX});
    const { data: hash, sendTransaction, } = useSendTransaction();
    const { signMessageAsync } = useSignMessage()
    const { refetch } = useBalance({
      address: address as Address
    });

    
    useEffect(() => {
        if (hash) {
          sendHash(hash);
        }
    }, [hash]);

    // function to send a tx
    const handleSendTx = () => {
      try {
        sendTransaction({
          ...TEST_TX,
          gas
        });
      } catch (err) {
        console.log('Error sending transaction:', err);
      }
    }

    // function to sing a msg 
    const handleSignMsg = async () => {
      const msg = "Hello Reown AppKit!"
      const sig = await signMessageAsync({ message: msg, account: address as Address }); 
      sendSignMsg(sig);
    }

    // function to get the balance
    const handleGetBalance = async () => {
      const balance = await refetch()
      sendBalance(balance?.data?.value.toString() + " " + balance?.data?.symbol.toString())
    }

    const handleDisconnect = async () => {
      try {
        await disconnect();
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    };


  return (
    isConnected && (
    <div >
        <button onClick={() => open()}>Open</button>
        <button onClick={handleDisconnect}>Disconnect</button>
        <button onClick={() => switchNetwork(pharos)}>Switch to Pharos</button>
        <button onClick={handleSignMsg}>Sign msg</button>
        <button onClick={handleSendTx}>Send tx</button>
        <button onClick={handleGetBalance}>Get Balance</button>  
    </div>
    )
  )
}
