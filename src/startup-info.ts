import { makeRequest } from './utils.js';
import fs from 'fs';
import path from 'path';

interface PackageInfo {
  name: string;
  version: string;
  description: string;
}

function getPackageInfo(): PackageInfo {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    return {
      name: packageJson.name || 'unknown',
      version: packageJson.version || '0.0.0',
      description: packageJson.description || 'No description'
    };
  } catch (error) {
    return {
      name: 'my-mcp-anytype',
      version: '1.0.0',
      description: 'Custom MCP server for Anytype'
    };
  }
}

function getAnytypePort(): string {
  return process.env.ANYTYPE_BASE_URL?.replace('http://localhost:', '') || '31009';
}

function getMCPPort(): string {
  // MCP server uses stdio, not a specific HTTP port
  return 'stdio (standard input/output)';
}

async function testAnytypeConnection(): Promise<{ success: boolean; message: string; spacesCount?: number }> {
  try {
    const response = await makeRequest('/v1/spaces');
    
    // Response might be an object with a property containing the array
    let spaces = response;
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      // Look for the spaces array in object properties
      const possibleArrays = Object.values(response).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        spaces = possibleArrays[0];
      }
    }
    
    if (Array.isArray(spaces)) {
      return {
        success: true,
        message: 'Connection successful',
        spacesCount: spaces.length
      };
    } else if (response) {
      return {
        success: true,
        message: 'Connection successful (non-standard response format)',
        spacesCount: undefined
      };
    } else {
      return {
        success: false,
        message: 'Empty response from API'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function formatDateTime(): string {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export async function displayStartupInfo(): Promise<void> {
  const packageInfo = getPackageInfo();
  const anytypePort = getAnytypePort();
  const mcpPort = getMCPPort();
  const apiKeyStatus = process.env.ANYTYPE_API_KEY ? 'Present' : 'Missing';
  
  console.error('\n' + '='.repeat(60));
  console.error('ANYTYPE MCP SERVER - STARTUP INFORMATION');
  console.error('='.repeat(60));
  
  console.error(`Name: ${packageInfo.name}`);
  console.error(`Version: ${packageInfo.version}`);
  console.error(`Description: ${packageInfo.description}`);
  console.error(`Started: ${formatDateTime()}`);
  
  console.error('\n' + '-'.repeat(40));
  console.error('PORT CONFIGURATION');
  console.error('-'.repeat(40));
  console.error(`MCP Server: ${mcpPort}`);
  console.error(`Anytype API: localhost:${anytypePort}`);
  console.error(`API Key: ${apiKeyStatus}`);
  
  console.error('\n' + '-'.repeat(40));
  console.error('CONNECTIVITY TEST');
  console.error('-'.repeat(40));
  
  const testResult = await testAnytypeConnection();
  
  if (testResult.success) {
    console.error(`Anytype API: ${testResult.message}`);
    if (testResult.spacesCount !== undefined) {
      console.error(`Spaces found: ${testResult.spacesCount}`);
    }
  } else {
    console.error(`Anytype API: ${testResult.message}`);
  }
  
  console.error('\n' + '-'.repeat(40));
  console.error('AVAILABLE TOOLS');
  console.error('-'.repeat(40));
  console.error('Spaces: list, get, create, update, members');
  console.error('Objects: search, list, get, create, update, delete');
  console.error('Properties: list, get, create, update, delete');
  console.error('Types: list, get, create, update, delete');
  console.error('Tags: list, get, create, update, delete');
  console.error('Templates: list, get');
  console.error('Lists: get_views, get_objects');
  
  console.error('\n' + '='.repeat(60));
  console.error('MCP Server ready to receive connections');
  console.error('='.repeat(60) + '\n');
}