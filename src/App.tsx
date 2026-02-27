/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Files, Search, GitBranch, Play, Blocks, User, Settings, 
  ChevronDown, X, Minus, Square, 
  PanelLeft, PanelBottom, PanelRight,
  Send, Paperclip, FileJson, FileText, FileCode2,
  AlertTriangle, Radio,
  FileTerminalIcon,
  FileStackIcon
} from 'lucide-react';

const files: Record<string, { name: string; language: string; content: string }> = {
  'thato.py': {
    name: 'thato.py',
    language: 'python',
    content: `# This is where we all start, right? A simple hello world.
print("Hello World")`
  },
  'thato2.py': {
    name: 'thato2.py',
    language: 'python',
    content: `from flask import Flask, render_template_string, jsonify, send_file
import io

app = Flask("Thato Matona's Portfolio")

@app.route('/')
def index():
    return render_template_string("Hello, welcome to my world!") # Sorry, no css

if __name__ == '__main__':
  app.run(debug=True, port=5000)`
  },
  'main.py': {
    name: 'main.py',
    language: 'python',
    content: `import pandas as pd
import numpy as np
from fuzzywuzzy import process

def haversine(lat1, lon1, lat2, lon2):
    try: 
        lat1, lon1, lat2, lon2 = [float(v) for v in [lat1, lon1, lat2, lon2]]
        R = 6371000  # Radius of Earth in meters
        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = np.sin(dlat/2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2.0)**2
        c = 2 * np.arcsin(np.sqrt(a))
        return round(R * c, 2)
    except ValueError:
        return float('inf')

def processMatchedDF(matched_df: pd.DataFrame):
    scores = []
    distances = []

    for __, site in matched_df.iterrows():
        momar_name = site['SiteName']
        mod_name = site['Site Name']
        momar_lat = site['Latitude_momar']
        momar_long = site['Longitude_momar']
        mod_lat = site['Latitude_mod']
        mod_long = site['Longitude_mod']

        _, score = process.extractOne(momar_name, [mod_name])
        distance = haversine(momar_lat, momar_long, mod_lat, mod_long)

        scores.append(score)
        distances.append(distance)

    matched_df['Name Check Score'] = scores
    matched_df['Distance Check Difference (m)'] = distances
    matched_df['BS Numbers match'] = ['Yes'] * len(matched_df)

    # Fix column order
    column_order = ['SiteId', 'SiteName', 'Latitude_momar', 'Longitude_momar', 'BS Number', 'Site ID', 'Site Name', 'Latitude_mod', 'Longitude_mod', "Operational Status", "Site Type", "Installation Type", 'Name Check Score', 'Distance Check Difference (m)', 'BS Numbers match']
    matched_df = matched_df[column_order]

def processFuzzyMatchedDF(fuzzy_matched_df: pd.DataFrame):
    scores = []
    bs_number_scores = []
    distances = []

    for __, site in fuzzy_matched_df.iterrows():
        momar_name = site['SiteName']
        mod_name = str(site['Site Name'])
        momar_lat = site['Latitude_momar']
        momar_long = site['Longitude_momar']
        mod_lat = site['Latitude_mod']
        mod_long = site['Longitude_mod']
        momar_bs_numbers = list(map(str, [site['2G.BS_Number'], site['3G.BS_Number'], site['4G.BS_Number']]))
        mod_formatted_bs_number = str(site['BS Num Formatted']).strip()

        _, score = process.extractOne(momar_name, [mod_name])
        _, bs_number_score = process.extractOne(mod_formatted_bs_number, momar_bs_numbers)
        distance = haversine(momar_lat, momar_long, mod_lat, mod_long)
        
        scores.append(0 if mod_name.strip()=='' else score)
        bs_number_scores.append('Yes' if (bs_number_score==100 and mod_formatted_bs_number!='') else 'No')
        distances.append(distance)

    fuzzy_matched_df['Name Check Score'] = scores
    fuzzy_matched_df['Distance Check Difference (m)'] = distances
    fuzzy_matched_df['BS Numbers match'] = bs_number_scores

    column_order = ['SiteId', 'SiteName', 'Latitude_momar', 'Longitude_momar', '2G.BS_Number', '3G.BS_Number', '4G.BS_Number', 'BS Num Formatted', 'Site ID', 'Site Name', 'Latitude_mod', 'Longitude_mod', "Operational Status", "Site Type", "Installation Type", 'Name Check Score', 'Distance Check Difference (m)', 'BS Numbers match']
    fuzzy_matched_df = fuzzy_matched_df[column_order]


if __name__ == '__main__':    
    excel_file_name = 'bs_code_matches.xlsx'
    print('Reading file...')

    matched_df = pd.read_excel(excel_file_name, 
                              sheet_name='Matched', 
                              usecols=['SiteId', 'SiteName', 'Latitude_momar', 'Longitude_momar', 'BS Number', 'Site ID', 'Site Name', 'Latitude_mod', 'Longitude_mod', "Operational Status", "Site Type", "Installation Type"])

    fuzzy_matched_df = pd.read_excel(excel_file_name, 
                              sheet_name='Fuzzy_Matched_momar', 
                              usecols=['SiteId', 'SiteName', 'Latitude_momar', 'Longitude_momar', '2G.BS_Number', '3G.BS_Number', '4G.BS_Number', 'BS Num Formatted', 'Site ID', 'Site Name', 'Latitude_mod', 'Longitude_mod', "Operational Status", "Site Type", "Installation Type"])

    print('Processing file...')
    processMatchedDF(matched_df)
    processFuzzyMatchedDF(fuzzy_matched_df)

    with pd.ExcelWriter('sanity_checks.xlsx') as writer:
        matched_df.to_excel(writer, sheet_name='Matched', index=False)
        fuzzy_matched_df.to_excel(writer, sheet_name='Fuzzy_Matched', index=False)
        
    print('Done')`
  },
  'getSites.sql': {
    name: 'getSites.sql',
    language: 'sql',
    content: `SELECT 
    *,
    COUNT(*) OVER (PARTITION BY SiteID) AS SiteID_Count
FROM Reports
WHERE ApprovedOn > '2024-07-01'
ORDER BY SiteID ASC, [ApprovedDate] DESC`
  },
  'package.json': {
    name: 'package.json',
    language: 'json',
    content: `{
  "name": "PORTFOLIO",
  "version": "1.0.0",
  "description": "A vs code-themed portfolio showcasing Thato Matona",
  "scripts": {
    "start": "python thato.py"
  }
}`
  },
  'profile.json': {
    name: 'profile.json',
    language: 'json',
    content: `{
  "name": "Thato Matona",
  "role": "EMF Compliance Engineer",
  "location": "South Africa",
  "email": "tmatona@alphawave.co.za",
  "phone": "+27732207474",
  "skills": ["Python", "SQL", "Power BI", "ETL", "Data Quality", "Automation"],
  "Currently Learning": ["AI", "Reinforcement Learning", "Large Language Models"],
  "Currently Working On": "A mobile network simulator game in Python to teach people how mobile
                          networks work and the challenges of network planning and optimization."
}`
  },
 'README.md': {
    name: 'README.md',
    language: 'markdown',
    content: `# Thato Matona — EMF Compliance Engineer

**Contact**
- Email: tmatona@alphawave.co.za
- Mobile: +27732207474

## Summary
Engineer experienced with Python, SQL, Power BI, data analysis and automation. 
Built complex SQL queries and dashboards, automated reporting pipelines, and resolved large-scale 
data quality issues. Passionate about turning messy data into actionable reports.

## Work Experience
**Alphawave Mobile Network Services** — EMF Compliance Engineer (2022–present)
- Built and maintain SQL queries and Power BI dashboards for operational reporting
- Automated reporting pipelines, certificate tracking and assessment reports
- Developed Python scripts for DB validation and automated error corrections
- Resolved legacy data quality issues integrating with momar and Netcon datasets

**Outlier.ai (G2i Inc)** — Software Engineer (AI RLHF) (2024–present)
- Created and validated structured datasets for AI training
- Evaluated and corrected AI generated code

## Projects
**Energy Leading Services** — Developed a data software to identify and prioritise high value 
                              leads and compiled a user manual for stakeholders.

## Technical Skills
- Python (pandas, numpy), SQL, Power BI, Excel
- Selenium, Playwright, Power Automate
- ETL workflows, validation, automated error correction`
  },
};

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.py')) return <FileCode2 className="w-4 h-4 mr-2 text-[#4b8bbe]" />;
  if (fileName.endsWith('.md')) return <FileText className="w-4 h-4 mr-2 text-[#007acc]" />;
  if (fileName.endsWith('.json')) return <FileJson className="w-4 h-4 mr-2 text-[#cbcb41]" />;
  if (fileName.endsWith('.sql')) return <FileStackIcon className="w-4 h-4 mr-2 text-[#e38c00]" />;
  return <FileText className="w-4 h-4 mr-2 text-[#cccccc]" />;
};

export default function App() {
  const [activeFile, setActiveFile] = useState<string | null>('thato2.py');
  const [openFiles, setOpenFiles] = useState<string[]>(['thato.py', 'thato2.py']);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('OUTPUT');

  const handleFileClick = (fileName: string) => {
    setActiveFile(fileName);
    if (!openFiles.includes(fileName)) {
      setOpenFiles([...openFiles, fileName]);
    }
    if (activeTab !== 'OUTPUT' && fileName === 'thato.py') {
      setActiveTab('OUTPUT');
    }
    else if (fileName === 'thato2.py') {
      setActiveTab('OUTPUT2');
    }
    else if (activeTab !== 'TERMINAL' && fileName === 'main.py') {
      setActiveTab('TERMINAL');
    }
  };

  const closeFile = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f !== fileName);
    setOpenFiles(newOpenFiles);
    if (activeFile === fileName) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const date = new Date().toISOString().split('T')
  const formattedDate = date[0] + ' ' + date[1].split('.')[0].split(':').slice(0, 2).join(':')

  return (
    <div className="flex flex-col h-screen w-full bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      {/* TitleBar */}
      <div className="h-8 bg-[#181818] flex items-center justify-between px-2 text-[13px] select-none border-b border-[#2d2d2d]">
        <div className="flex items-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg" alt="VS Code" className="w-4 h-4" />
          <div className="flex gap-1 text-[#cccccc]">
            <span className="cursor-pointer hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded">File</span>
            <span className="cursor-pointer hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded">Edit</span>
            <span className="cursor-pointer hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded">Selection</span>
            <span className="cursor-pointer hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded">View</span>
            <span className="cursor-pointer hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded">Go</span>
            <span className="cursor-pointer hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded">Run</span>
            <span className="cursor-pointer hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded" onClick={() => setIsPanelOpen(!isPanelOpen)}>Terminal</span>
            <span className="cursor-pointer hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded">Help</span>
          </div>
        </div>
        <div className="text-[#858585] flex-1 text-center text-xs">
          {activeFile ? activeFile : 'Welcome'} - Thato Matona Portfolio - Visual Studio Code
        </div>
        <div className="flex items-center gap-2 text-[#858585]">
          <PanelLeft className={`w-4 h-4 cursor-pointer hover:text-[#cccccc] ${isSidebarOpen ? 'text-[#cccccc]' : ''}`} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <PanelBottom className={`w-4 h-4 cursor-pointer hover:text-[#cccccc] ${isPanelOpen ? 'text-[#cccccc]' : ''}`} onClick={() => setIsPanelOpen(!isPanelOpen)} />
          <PanelRight className={`w-4 h-4 cursor-pointer hover:text-[#cccccc] ${isRightSidebarOpen ? 'text-[#cccccc]' : ''}`} onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} />
          <div className="flex items-center ml-2 gap-2">
            <Minus className="w-4 h-4 cursor-pointer hover:text-[#cccccc]" />
            <Square className="w-3 h-3 cursor-pointer hover:text-[#cccccc]" />
            <X className="w-4 h-4 cursor-pointer hover:text-[#cccccc]" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ActivityBar */}
        <div className="w-12 bg-[#181818] flex flex-col items-center py-2 justify-between border-r border-[#2d2d2d]">
          <div className="flex flex-col gap-4 w-full items-center">
            <div className="relative w-full flex justify-center cursor-pointer text-[#858585] hover:text-[#cccccc]">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#007acc]"></div>
              <Files className="w-6 h-6 text-[#cccccc]" />
            </div>
            <Search className="w-6 h-6 text-[#858585] cursor-pointer hover:text-[#cccccc]" />
            <GitBranch className="w-6 h-6 text-[#858585] cursor-pointer hover:text-[#cccccc]" />
            <Play className="w-6 h-6 text-[#858585] cursor-pointer hover:text-[#cccccc]" />
            <Blocks className="w-6 h-6 text-[#858585] cursor-pointer hover:text-[#cccccc]" />
          </div>
          <div className="flex flex-col gap-4 w-full items-center">
            <User className="w-6 h-6 text-[#858585] cursor-pointer hover:text-[#cccccc]" />
            <Settings className="w-6 h-6 text-[#858585] cursor-pointer hover:text-[#cccccc]" />
          </div>
        </div>

        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="w-64 bg-[#181818] flex flex-col border-r border-[#2d2d2d]">
            <div className="h-9 flex items-center px-4 text-[11px] text-[#cccccc] tracking-wider">
              EXPLORER
            </div>
            <div className="flex flex-col">
              <div className="flex items-center px-1 py-1 cursor-pointer hover:bg-[#2a2d2e] text-sm font-bold">
                <ChevronDown className="w-4 h-4 mr-1" />
                PORTFOLIO
              </div>
              <div className="flex flex-col">
                {Object.keys(files).map(fileName => (
                  <div 
                    key={fileName}
                    className={`flex items-center px-6 py-1 cursor-pointer text-[13px] ${activeFile === fileName ? 'bg-[#37373d] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'}`}
                    onClick={() => handleFileClick(fileName)}
                  >
                    {getFileIcon(fileName)}
                    {fileName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex flex-col flex-1 overflow-hidden border-r border-[#2d2d2d]">
              {/* EditorTabs */}
              <div className="flex h-9 bg-[#181818] overflow-x-auto no-scrollbar">
                {openFiles.map(fileName => (
                  <div 
                    key={fileName}
                    className={`flex items-center px-3 min-w-fit cursor-pointer border-r border-[#2d2d2d] text-[13px] ${activeFile === fileName ? 'bg-[#1e1e1e] text-[#ffffff] border-t border-t-[#007acc]' : 'bg-[#2d2d2d] text-[#858585] border-t border-t-transparent hover:bg-[#2b2b2b]'}`}
                    onClick={() => handleFileClick(fileName)}
                  >
                    {getFileIcon(fileName)}
                    <span className="mr-2">{fileName}</span>
                    <X 
                      className={`w-4 h-4 rounded hover:bg-[#333333] ${activeFile === fileName ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} 
                      onClick={(e) => closeFile(e, fileName)}
                    />
                  </div>
                ))}
              </div>

              {/* EditorContent */}
              <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                {activeFile && files[activeFile] ? (
                  <SyntaxHighlighter
                    language={files[activeFile].language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '16px', background: '#1e1e1e', fontSize: '14px' }}
                    showLineNumbers={true}
                    lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#858585', textAlign: 'right' }}
                  >
                    {files[activeFile].content}
                  </SyntaxHighlighter>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#858585]">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg" alt="VS Code" className="w-32 h-32 opacity-10" />
                  </div>
                )}
              </div>
            </div>

            {/* RightSidebar */}
            {isRightSidebarOpen && (
              <div className="w-80 bg-[#181818] flex flex-col">
                <div className="h-9 flex items-center justify-between px-4 text-[11px] text-[#cccccc] tracking-wider border-b border-[#2d2d2d]">
                  <div className="flex items-center gap-4">
                    <span className="text-[#e7e7e7] border-b border-[#e7e7e7] cursor-pointer h-9 flex items-center">CHAT</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#858585]">
                    <X className="w-4 h-4 cursor-pointer hover:text-[#cccccc]" onClick={() => setIsRightSidebarOpen(false)} />
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#cccccc]">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg" className="w-4 h-4" alt="Copilot" />
                      GitHub Copilot
                    </div>
                    <div className="text-[13px] text-[#cccccc] bg-[#2d2d2d] p-3 rounded-md">
                      Hello! I'm GitHub Copilot. I can help you with your code, or can I?
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-[#2d2d2d]">
                  <div className="bg-[#2d2d2d] rounded-md flex flex-col border border-[#3d3d3d] focus-within:border-[#007acc]">
                    <div className="flex items-center px-2 py-1 border-b border-[#3d3d3d]">
                      <div className="flex items-center gap-1 text-[11px] text-[#858585] bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#3d3d3d]">
                        <Paperclip className="w-3 h-3" />
                        {activeFile || 'No file'}
                      </div>
                    </div>
                    <textarea 
                      className="w-full bg-transparent text-[13px] text-[#cccccc] p-2 outline-none resize-none h-16"
                      placeholder="Ask Copilot or type / for commands"
                    />
                    <div className="flex justify-between items-center px-2 py-1">
                      <div className="flex gap-2">
                        <Paperclip className="w-4 h-4 text-[#858585] cursor-pointer hover:text-[#cccccc]" />
                      </div>
                      <Send className="w-4 h-4 text-[#858585] cursor-pointer hover:text-[#cccccc]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel */}
          {isPanelOpen && (
            <div className="h-64 bg-[#1e1e1e] border-t border-[#2d2d2d] flex flex-col">
              <div className="flex h-9 items-center px-4 gap-4 text-[11px] tracking-wider">
                {['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL'].map(tab => (
                  <div 
                    key={tab}
                    className={`cursor-pointer h-9 flex items-center ${(activeTab === tab) || (tab === 'OUTPUT' && activeFile === 'thato2.py')
                                ? 'text-[#e7e7e7] border-b border-[#e7e7e7]'
                                : 'text-[#858585] hover:text-[#cccccc]'}'}`}
                    onClick={() => setActiveTab(tab)} // this then selects the "OUTPUT2" tab if needed
                  >
                    {tab}
                  </div>
                ))}
                <div className="flex-1"></div>
                <div className="flex items-center gap-2 text-[#858585]">
                  <X className="w-4 h-4 cursor-pointer hover:text-[#cccccc]" onClick={() => setIsPanelOpen(false)} />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 text-[13px] font-mono text-[#cccccc]">
                {activeTab === 'OUTPUT' && (
                  <div>
                    <div className="text-[#007acc]">[Running] python -u "c:\\Python\\Personal Website Ideas\\2\\thato.py"</div>
                    <div className="text-[#858585]">Hello World</div>
                    <br/>
                    <div className="text-[#007acc]">[Done] exited with code=1 in 000.002 seconds</div>
                    <br/>
                  </div>
                )}
                {activeTab === 'OUTPUT2' && (
                  <div>
                    <div className="text-[#007acc]">[Running] python -u "c:\\Python\\Personal Website Ideas\\2\\thato2.py"</div>
                    <div className="text-[#858585]">* Serving Flask app 'PORTFOLIO'</div>
                    <div className="text-[#858585]">* Debug mode: on</div>
                    <div className="text-[#f48771]">WARNING: This is a development server. Do not use it in a production deployment.</div>
                    <div className="text-[#858585]">* Running on <span className="text-[#007acc] underline cursor-pointer">http://127.0.0.1:5000</span></div>
                    <div className="text-[#858585]">Press CTRL+C to quit</div>
                    <div className="text-[#858585]">* Restarting with watchdog (windowsapi)</div>
                    <div className="text-[#858585]">* Debugger is active!</div>
                    <div className="text-[#858585]">* Debugger PIN: XXX-XXX-XXX</div>
                    <div>| 127.0.0.1 - - [{formattedDate}] "GET / HTTP/1.1" 200 -</div>
                    <br/>
                    <div className="text-[#007acc]">[Done] exited with code=1 in 289.795 seconds</div>
                    <br/>
                  </div>
                )}
                {activeTab === 'TERMINAL' && (
                  <div>
                    <span className="text-[#007acc]">PS C:\\Users\\Thato\\Portfolio&gt;</span> python main.py
                    <br/>
                    Reading file...
                    <br/>
                    Processing file...
                    <br/>
                    Done
                    <br/>
                    <span className="text-[#007acc]">PS C:\\Users\\Thato\\Portfolio&gt;</span> <span className="animate-pulse">_</span>
                  </div>
                )}
                {activeTab === 'PROBLEMS' && (
                  <div className="text-[#858585]">No problems have been detected in the workspace.</div>
                )}
                {activeTab === 'DEBUG CONSOLE' && (
                  <div className="text-[#858585]">Please start a debug session to evaluate expressions.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* StatusBar */}
      <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-2 text-[12px] select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-[#1f8ad2] px-1 rounded">
            <GitBranch className="w-3.5 h-3.5" />
            main
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:bg-[#1f8ad2] px-1 rounded">
            <X className="w-3.5 h-3.5" /> 0
            <AlertTriangle className="w-3.5 h-3.5 ml-1" /> 0
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="cursor-pointer hover:bg-[#1f8ad2] px-1 rounded">Ln 9, Col 12</div>
          <div className="cursor-pointer hover:bg-[#1f8ad2] px-1 rounded">Spaces: 2</div>
          <div className="cursor-pointer hover:bg-[#1f8ad2] px-1 rounded">UTF-8</div>
          <div className="cursor-pointer hover:bg-[#1f8ad2] px-1 rounded">CRLF</div>
          <div className="flex items-center gap-1 cursor-pointer hover:bg-[#1f8ad2] px-1 rounded">
            {'{ }'} Python
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:bg-[#1f8ad2] px-1 rounded">
            <Radio className="w-3.5 h-3.5" /> Go Live
          </div>
        </div>
      </div>
    </div>
  );
}

