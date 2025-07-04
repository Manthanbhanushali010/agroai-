/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  DeployContractOptions,
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomicfoundation/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "AutomationBase",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AutomationBase__factory>;
    getContractFactory(
      name: "AutomationCompatible",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AutomationCompatible__factory>;
    getContractFactory(
      name: "AutomationCompatibleInterface",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AutomationCompatibleInterface__factory>;
    getContractFactory(
      name: "AggregatorV3Interface",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AggregatorV3Interface__factory>;
    getContractFactory(
      name: "VRFCoordinatorV2Interface",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.VRFCoordinatorV2Interface__factory>;
    getContractFactory(
      name: "ConfirmedOwner",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ConfirmedOwner__factory>;
    getContractFactory(
      name: "ConfirmedOwnerWithProposal",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ConfirmedOwnerWithProposal__factory>;
    getContractFactory(
      name: "IOwnable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IOwnable__factory>;
    getContractFactory(
      name: "VRFConsumerBaseV2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.VRFConsumerBaseV2__factory>;
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "Pausable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Pausable__factory>;
    getContractFactory(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20__factory>;
    getContractFactory(
      name: "ERC20Burnable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20Burnable__factory>;
    getContractFactory(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Metadata__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "AgroAICore",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AgroAICore__factory>;
    getContractFactory(
      name: "AgroAIToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AgroAIToken__factory>;
    getContractFactory(
      name: "FunctionsClient",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.FunctionsClient__factory>;
    getContractFactory(
      name: "IFunctionsRouter",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IFunctionsRouter__factory>;
    getContractFactory(
      name: "IFunctionsClient",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IFunctionsClient__factory>;
    getContractFactory(
      name: "FunctionsRequest",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.FunctionsRequest__factory>;
    getContractFactory(
      name: "FunctionsRequest",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.FunctionsRequest__factory>;

    getContractAt(
      name: "AutomationBase",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.AutomationBase>;
    getContractAt(
      name: "AutomationCompatible",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.AutomationCompatible>;
    getContractAt(
      name: "AutomationCompatibleInterface",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.AutomationCompatibleInterface>;
    getContractAt(
      name: "AggregatorV3Interface",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.AggregatorV3Interface>;
    getContractAt(
      name: "VRFCoordinatorV2Interface",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.VRFCoordinatorV2Interface>;
    getContractAt(
      name: "ConfirmedOwner",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ConfirmedOwner>;
    getContractAt(
      name: "ConfirmedOwnerWithProposal",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ConfirmedOwnerWithProposal>;
    getContractAt(
      name: "IOwnable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IOwnable>;
    getContractAt(
      name: "VRFConsumerBaseV2",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.VRFConsumerBaseV2>;
    getContractAt(
      name: "Ownable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "Pausable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Pausable>;
    getContractAt(
      name: "ERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20>;
    getContractAt(
      name: "ERC20Burnable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20Burnable>;
    getContractAt(
      name: "IERC20Metadata",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Metadata>;
    getContractAt(
      name: "IERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "AgroAICore",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.AgroAICore>;
    getContractAt(
      name: "AgroAIToken",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.AgroAIToken>;
    getContractAt(
      name: "FunctionsClient",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.FunctionsClient>;
    getContractAt(
      name: "IFunctionsRouter",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IFunctionsRouter>;
    getContractAt(
      name: "IFunctionsClient",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IFunctionsClient>;
    getContractAt(
      name: "FunctionsRequest",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.FunctionsRequest>;
    getContractAt(
      name: "FunctionsRequest",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.FunctionsRequest>;

    deployContract(
      name: "AutomationBase",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AutomationBase>;
    deployContract(
      name: "AutomationCompatible",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AutomationCompatible>;
    deployContract(
      name: "AutomationCompatibleInterface",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AutomationCompatibleInterface>;
    deployContract(
      name: "AggregatorV3Interface",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AggregatorV3Interface>;
    deployContract(
      name: "VRFCoordinatorV2Interface",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.VRFCoordinatorV2Interface>;
    deployContract(
      name: "ConfirmedOwner",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ConfirmedOwner>;
    deployContract(
      name: "ConfirmedOwnerWithProposal",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ConfirmedOwnerWithProposal>;
    deployContract(
      name: "IOwnable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IOwnable>;
    deployContract(
      name: "VRFConsumerBaseV2",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.VRFConsumerBaseV2>;
    deployContract(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Ownable>;
    deployContract(
      name: "Pausable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Pausable>;
    deployContract(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20>;
    deployContract(
      name: "ERC20Burnable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20Burnable>;
    deployContract(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Metadata>;
    deployContract(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20>;
    deployContract(
      name: "AgroAICore",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AgroAICore>;
    deployContract(
      name: "AgroAIToken",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AgroAIToken>;
    deployContract(
      name: "FunctionsClient",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FunctionsClient>;
    deployContract(
      name: "IFunctionsRouter",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IFunctionsRouter>;
    deployContract(
      name: "IFunctionsClient",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IFunctionsClient>;
    deployContract(
      name: "FunctionsRequest",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FunctionsRequest>;
    deployContract(
      name: "FunctionsRequest",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FunctionsRequest>;

    deployContract(
      name: "AutomationBase",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AutomationBase>;
    deployContract(
      name: "AutomationCompatible",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AutomationCompatible>;
    deployContract(
      name: "AutomationCompatibleInterface",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AutomationCompatibleInterface>;
    deployContract(
      name: "AggregatorV3Interface",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AggregatorV3Interface>;
    deployContract(
      name: "VRFCoordinatorV2Interface",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.VRFCoordinatorV2Interface>;
    deployContract(
      name: "ConfirmedOwner",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ConfirmedOwner>;
    deployContract(
      name: "ConfirmedOwnerWithProposal",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ConfirmedOwnerWithProposal>;
    deployContract(
      name: "IOwnable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IOwnable>;
    deployContract(
      name: "VRFConsumerBaseV2",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.VRFConsumerBaseV2>;
    deployContract(
      name: "Ownable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Ownable>;
    deployContract(
      name: "Pausable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Pausable>;
    deployContract(
      name: "ERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20>;
    deployContract(
      name: "ERC20Burnable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20Burnable>;
    deployContract(
      name: "IERC20Metadata",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Metadata>;
    deployContract(
      name: "IERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20>;
    deployContract(
      name: "AgroAICore",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AgroAICore>;
    deployContract(
      name: "AgroAIToken",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.AgroAIToken>;
    deployContract(
      name: "FunctionsClient",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FunctionsClient>;
    deployContract(
      name: "IFunctionsRouter",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IFunctionsRouter>;
    deployContract(
      name: "IFunctionsClient",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IFunctionsClient>;
    deployContract(
      name: "FunctionsRequest",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FunctionsRequest>;
    deployContract(
      name: "FunctionsRequest",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FunctionsRequest>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
  }
}
