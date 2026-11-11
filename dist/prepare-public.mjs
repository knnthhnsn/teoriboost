import {readdir,mkdir,copyFile,writeFile,readFile,lstat,realpath,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const MARKER='.teoriboost-static-output.json';
const MARKER_TEXT='{"format":"teoriboost-static-public-v1"}\n';
const publicRoots=new Set(['assets','images','fonts','media','audio','video','models','textures','icons','locales','vendor','.well-known']);
const privateRoots=new Set(['api','node_modules','public','server','servers','backend','functions','lib','src','tools','scripts','tests','test','firebase','docs','coverage','build','dist']);
const rootStaticExtensions=new Set(['.html','.css','.js','.json','.webmanifest','.txt','.xml','.ico','.svg','.png','.jpg','.jpeg','.webp','.avif','.gif','.woff','.woff2','.ttf','.otf','.mp3','.wav','.ogg','.mp4','.webm','.wasm']);
const serverExtensions=new Set(['.mjs','.cjs','.ts','.tsx','.jsx','.php','.py','.rb','.go','.sh','.ps1','.bat','.cmd','.pem','.key','.p12','.pfx']);
class PublicBuildError extends Error {constructor(code){super(code);this.code=code;}}
const refuse=code=>{throw new PublicBuildError(code);};
function excluded(name,isDirectory){const lower=name.toLowerCase();return (lower.startsWith('.')&&lower!=='.well-known')||privateRoots.has(lower)||(!isDirectory&&(lower.startsWith('env')||/^package.*\.json$/.test(lower)||lower==='vercel.json'||/^(?:server|backend|service-account|credentials|secrets)(?:[._-]|$)/.test(lower)||serverExtensions.has(path.extname(lower))));}
function assertChild(root,target,name){if(path.relative(root,target)!==name||path.dirname(target)!==root)refuse('UNSAFE_PUBLIC_PATH');}
async function exists(file){try{return await lstat(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function verifyPrevious(root,destination){
  assertChild(root,destination,'public');const info=await exists(destination);if(!info)return false;
  if(info.isSymbolicLink()||!info.isDirectory()||await realpath(destination)!==destination)refuse('UNSAFE_PUBLIC_DIRECTORY');
  const entries=await readdir(destination);if(!entries.length)return true;
  const marker=path.join(destination,MARKER),markerInfo=await exists(marker);
  if(!markerInfo?.isFile()||markerInfo.isSymbolicLink()||await readFile(marker,'utf8')!==MARKER_TEXT)refuse('UNMANAGED_PUBLIC_DIRECTORY');return true;
}
export async function preparePublic({root=ROOT}={}){
  const sourceRoot=await realpath(root),destination=path.join(sourceRoot,'public');
  await verifyPrevious(sourceRoot,destination);
  const temporaryName='.public-build-'+randomUUID(),temporary=path.join(sourceRoot,temporaryName);assertChild(sourceRoot,temporary,temporaryName);
  await mkdir(temporary);let files=0,bytes=0;
  async function copyDirectory(source,target,atRoot=false){for(const entry of await readdir(source,{withFileTypes:true})){
    if(excluded(entry.name,entry.isDirectory()))continue;
    if(atRoot&&entry.isDirectory()&&!publicRoots.has(entry.name.toLowerCase()))continue;
    const from=path.join(source,entry.name),to=path.join(target,entry.name),info=await lstat(from);
    if(info.isSymbolicLink())refuse('STATIC_SOURCE_LINK');
    if(info.isDirectory()){await mkdir(to);await copyDirectory(from,to);}
    else if(info.isFile()){
      if(atRoot&&!rootStaticExtensions.has(path.extname(entry.name).toLowerCase()))continue;
      await copyFile(from,to);files++;bytes+=info.size;
    }else refuse('STATIC_SOURCE_NOT_FILE');
  }}
  try{
    await copyDirectory(sourceRoot,temporary,true);
    if(!(await exists(path.join(temporary,'index.html')))?.isFile())refuse('PUBLIC_INDEX_MISSING');
    await writeFile(path.join(temporary,MARKER),MARKER_TEXT,'utf8');
    // Only this verified, directly contained managed output can be recursively
    // replaced. Never remove a source directory, link, dependency or user cache.
    if(await verifyPrevious(sourceRoot,destination)){assertChild(sourceRoot,destination,'public');await rm(destination,{recursive:true,force:false});}
    await rename(temporary,destination);
    return {ok:true,staticFiles:files,staticBytes:bytes,apiCopied:false,serverFilesCopied:false};
  }catch(error){
    assertChild(sourceRoot,temporary,temporaryName);const info=await exists(temporary);if(info){if(info.isSymbolicLink()||await realpath(temporary)!==temporary)refuse('UNSAFE_TEMPORARY_DIRECTORY');await rm(temporary,{recursive:true,force:true});}
    throw error;
  }
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){try{const result=await preparePublic();process.stdout.write(JSON.stringify(result)+'\n');}catch(error){process.stderr.write(`Public build refused: ${error instanceof PublicBuildError?error.code:'PUBLIC_BUILD_IO_ERROR'}\n`);process.exitCode=1;}}
