const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function sendTeamsNotification() {
  try {
    console.log('Report generation timestamp:', new Date().toISOString());

    console.log('=== FILE DIAGNOSTICS ===');
    try {
      console.log('Current directory contents:', fs.readdirSync('.').join(', '));

      if (fs.existsSync('allure-report')) {
        console.log('allure-report contents:', fs.readdirSync('allure-report').join(', '));

        if (fs.existsSync('allure-report/widgets')) {
          console.log('allure-report/widgets contents:', fs.readdirSync('allure-report/widgets').join(', '));
        }

        if (fs.existsSync('allure-report/history')) {
          console.log('allure-report/history contents:', fs.readdirSync('allure-report/history').join(', '));
        }
      }
    } catch (error) {
      console.log('Error listing directories:', error.message);
    }
    console.log('========================');
    const eventName = process.env.GITHUB_EVENT_NAME || '';
    const workflowName = process.env.GITHUB_WORKFLOW || '';
    const isScheduledRun = eventName === 'schedule';
    const isDailyReport = workflowName.includes('Daily Report');
    const isManualRun = eventName === 'workflow_dispatch';

    if (!isScheduledRun && !isDailyReport && !isManualRun) {
      console.log('Skipping Teams notification: Not a scheduled run, daily report, or manual run');
      console.log('Event name:', eventName);
      console.log('Workflow name:', workflowName);
      return;
    }

    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('TEAMS_WEBHOOK_URL is not defined!');
      process.exit(1);
    }

    const summaryPath = path.join('allure-report', 'widgets', 'summary.json');
    const metadataPath = path.join('allure-report', 'widgets', 'test-metadata.json');

    if (!fs.existsSync(summaryPath)) {
      console.error('CRITICAL ERROR: summary.json not found in main path!');
      process.exit(1);
    }

    let testRunId = null;
    let testRunNumber = null;

    if (fs.existsSync(metadataPath)) {
      try {
        console.log('Reading test metadata...');
        const metadataContent = fs.readFileSync(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);
        testRunId = metadata.runId;
        testRunNumber = metadata.runNumber;
        console.log(`Found test run metadata: Run #${testRunNumber}, ID: ${testRunId}`);
      } catch (error) {
        console.warn(`Could not read test metadata: ${error.message}`);
      }
    } else {
      console.warn('Test metadata file not found, will use generic workflow link');
    }

    let testStats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
    };
    let dataIsRecent = false;
    let dataAge = 'unknown';

    try {
      const summaryContent = fs.readFileSync(summaryPath, 'utf8');
      console.log('Processing summary.json...');

      try {
        const stats = fs.statSync(summaryPath);
        console.log(`File modified: ${stats.mtime.toISOString()}, size: ${stats.size} bytes`);
      } catch (e) {
        console.log(`Could not get file stats: ${e.message}`);
      }

      const summary = JSON.parse(summaryContent);

      if (summary && summary.time && summary.time.start) {
        const testTimestamp = new Date(summary.time.start);
        console.log('Test data timestamp:', testTimestamp.toISOString());

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = testTimestamp.toDateString() === today.toDateString();
        const isYesterday = testTimestamp.toDateString() === yesterday.toDateString();

        if (isToday) {
          dataIsRecent = true;
          dataAge = 'from today';
        } else if (isYesterday) {
          dataIsRecent = true;
          dataAge = 'from yesterday';
        } else {
          dataIsRecent = false;
          const diffTime = Math.abs(today - testTimestamp);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          dataAge = `from ${diffDays} days ago`;
        }

        console.log(`Data age: ${dataAge}`);
      }

      if (summary && summary.statistic) {
        const calculatedTotal = (summary.statistic.passed || 0) + (summary.statistic.failed || 0) + (summary.statistic.skipped || 0);

        if (calculatedTotal !== summary.statistic.total) {
          console.warn('WARNING: Numbers in summary.json are inconsistent!');
          console.warn(`Declared total: ${summary.statistic.total}, Calculated: ${calculatedTotal}`);

          summary.statistic.total = calculatedTotal;
        }

        testStats = {
          total: summary.statistic.total || 0,
          passed: summary.statistic.passed || 0,
          failed: summary.statistic.failed || 0,
          skipped: summary.statistic.skipped || 0,
          duration: (summary.time && summary.time.duration) || 0,
        };

        console.log('Extracted test statistics:', testStats);
      } else {
        console.warn('summary.json structure is not as expected');
      }
    } catch (error) {
      console.error(`Error reading summary.json: ${error.message}`);
    }

    const historyPath = path.join('allure-report', 'history', 'history.json');
    let trendInfo = '';

    if (fs.existsSync(historyPath)) {
      try {
        console.log(`History file found at: ${historyPath}`);
        const historyContent = fs.readFileSync(historyPath, 'utf8');
        console.log(`History file size: ${historyContent.length} bytes`);

        const history = JSON.parse(historyContent);
        const historyEntries = Object.values(history);

        console.log(`Found ${historyEntries.length} history entries`);

        if (testStats.total === 0 && historyEntries.length > 0) {
          console.log('Summary.json has zero tests. Checking history data instead.');

          const runs = [];
          historyEntries.forEach((entry) => {
            if (entry.statistic && entry.items && entry.items.length > 0) {
              entry.items.forEach((item) => {
                if (item.status && item.time && item.time.start) {
                  runs.push({
                    date: new Date(item.time.start),
                    status: item.status,
                    statistic: entry.statistic,
                  });
                }
              });
            }
          });

          runs.sort((a, b) => b.date - a.date);

          if (runs.length > 0) {
            const latestRun = runs[0];
            if (latestRun && latestRun.statistic && latestRun.statistic.total > 0) {
              console.log('Found valid statistics in history, using latest run from:', latestRun.date.toISOString());

              testStats = {
                total: latestRun.statistic.total || 0,
                passed: latestRun.statistic.passed || 0,
                failed: latestRun.statistic.failed || 0,
                skipped: latestRun.statistic.skipped || 0,
                duration: testStats.duration,
              };

              console.log('Updated test statistics from history:', testStats);

              const today = new Date();
              const testDate = latestRun.date;

              const isToday = testDate.toDateString() === today.toDateString();
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const isYesterday = testDate.toDateString() === yesterday.toDateString();

              if (isToday) {
                dataIsRecent = true;
                dataAge = 'from today';
              } else if (isYesterday) {
                dataIsRecent = true;
                dataAge = 'from yesterday';
              } else {
                dataIsRecent = false;
                const diffTime = Math.abs(today - testDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                dataAge = `from ${diffDays} days ago`;
              }

              console.log(`Updated data age: ${dataAge}`);
            }
          }
        }

        if (historyEntries.length > 0) {
          console.log('First history entry:', JSON.stringify(historyEntries[0]).substring(0, 200) + '...');
        }

        if (historyEntries.length >= 2) {
          const runs = [];

          historyEntries.forEach((entry) => {
            if (entry.statistic && entry.items && entry.items.length > 0) {
              entry.items.forEach((item) => {
                if (item.status && item.time && item.time.start) {
                  runs.push({
                    date: new Date(item.time.start),
                    status: item.status,
                    statistic: entry.statistic,
                  });
                }
              });
            }
          });

          runs.sort((a, b) => b.date - a.date);
          console.log(`Extracted ${runs.length} unique test runs`);

          const uniqueRuns = [];
          const seenDates = new Set();

          for (const run of runs) {
            const dateString = run.date.toDateString();
            if (!seenDates.has(dateString) && run.statistic && typeof run.statistic.total === 'number' && run.statistic.total > 0) {
              seenDates.add(dateString);
              uniqueRuns.push(run);

              if (uniqueRuns.length >= 2) break;
            }
          }

          if (uniqueRuns.length >= 2) {
            const current = uniqueRuns[0].statistic;
            const previous = uniqueRuns[1].statistic;

            console.log('Current run date:', uniqueRuns[0].date.toISOString());
            console.log('Previous run date:', uniqueRuns[1].date.toISOString());
            console.log('Current stats:', current);
            console.log('Previous stats:', previous);

            if (current && previous && current.total > 0 && previous.total > 0) {
              const currentPassRate = Math.round((current.passed / current.total) * 100);
              const previousPassRate = Math.round((previous.passed / previous.total) * 100);

              console.log(`Current pass rate: ${currentPassRate}%, Previous pass rate: ${previousPassRate}%`);

              if (!isNaN(currentPassRate) && !isNaN(previousPassRate)) {
                const diff = currentPassRate - previousPassRate;
                const trendEmoji = diff > 0 ? '📈' : (diff < 0 ? '📉' : '➡️');

                trendInfo = `
**Comparação com execução anterior:**
${trendEmoji} Taxa de aprovação: ${diff > 0 ? '+' : ''}${diff}% (${previousPassRate}% → ${currentPassRate}%)
`;
              }
            }
          } else {
            console.log('Not enough unique runs with valid statistics found');
          }
        } else {
          console.log('Not enough history entries found');
        }
      } catch (error) {
        console.error(`Error processing history file: ${error.message}`);
        console.error(error.stack);
      }
    } else {
      console.log(`History file not found at: ${historyPath}`);

      const alternativeHistoryPaths = [
        path.join('gh-pages', 'history', 'history', 'history.json'),
        path.join('gh-pages', 'history', 'history.json'),
      ];

      for (const altPath of alternativeHistoryPaths) {
        if (fs.existsSync(altPath)) {
          console.log(`Found alternative history file at: ${altPath}`);
          try {
            const historyContent = fs.readFileSync(altPath, 'utf8');
            JSON.parse(historyContent);
            console.log(`Alternative history file appears valid (${historyContent.length} bytes)`);
          } catch (err) {
            console.log(`Alternative history file is not valid JSON: ${err.message}`);
          }
        }
      }
    }

    const safePercent = (numerator, denominator) => {
      if (denominator === 0) return 0;
      const result = Math.round((numerator / denominator) * 100);
      return isNaN(result) ? 0 : result;
    };

    const durationInSeconds = Math.floor(testStats.duration / 1000);
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    const formattedDuration = `${minutes}m ${seconds}s`;

    const passRate = safePercent(testStats.passed, testStats.total);

    let buildStatus = testStats.failed > 0 ? '❌ FALHOU' : '✅ SUCESSO';
    if (testStats.total === 0) {
      buildStatus = '⚠️ SEM DADOS';
    }

    const themeColor = getStatusColor(passRate, testStats);

    const progressBar = createProgressBar(testStats);
    const chart = createASCIIChart(testStats);

    const repoName = process.env.GITHUB_REPOSITORY || '';
    const reportUrl = `https://${repoName.split('/')[0]}.github.io/${repoName.split('/')[1]}/`;

    const workflow = process.env.GITHUB_WORKFLOW || 'Tests';
    const runNumber = testRunNumber || process.env.GITHUB_RUN_NUMBER || '';
    
    const playwrightTestsUrl = testRunId && repoName 
      ? `https://github.com/${repoName}/actions/runs/${testRunId}`
      : (repoName ? `https://github.com/${repoName}/actions/workflows/tests.yml` : '');

    const timestamp = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const dataAgeWarning = !dataIsRecent && dataAge !== 'unknown' ?
      `⚠️ Report based on data ${dataAge}` :
      '';

    const message = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      'themeColor': themeColor,
      'summary': `Clínica - Relatório de Automação de Testes: ${buildStatus}`,
      'sections': [
        {
          'activityTitle': `📊 Clínica - Relatório de Teste Automatizado: ${buildStatus}`,
          'activitySubtitle': `Workflow: Clínica - Daily Report - ${timestamp} ${dataAgeWarning}`,
          'activityImage': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          'facts': [
            {
              'name': 'Executado por:',
              'value': '🤖 Clínica QA Bot',
            },
            {
              'name': 'Execução Playwright Tests: #',
              'value': runNumber,
            },
            {
              'name': 'Status: ',
              'value': getStatusWithEmoji(testStats),
            },
            {
              'name': 'Taxa de Aprovação: ',
              'value': `${passRate}%`,
            },
            {
              'name': 'Duração: ',
              'value': formattedDuration,
            },
          ],
          'markdown': true,
        },
        {
          'title': 'Detalhamento dos Resultados: ',
          'text': `${progressBar}\n\n${getTestStatsMarkdown(testStats, safePercent)}`,
          'markdown': true,
        },
      ],
      'potentialAction': [
        {
          '@type': 'OpenUri',
          'name': 'Ver relatório detalhado:',
          'targets': [
            { 'os': 'default', 'uri': reportUrl },
          ],
        },
      ],
    };

    if (testStats.total > 0) {
      message.sections.push({
        'title': 'Visualização Gráfica:',
        'text': chart,
        'markdown': true,
      });
    }

    if (trendInfo) {
      message.sections.push({
        'title': 'Análise de Tendência:',
        'text': trendInfo,
        'markdown': true,
      });
    }

    if (playwrightTestsUrl) {
      message.potentialAction.push({
        '@type': 'OpenUri',
        'name': 'Ver execução no GitHub',
        'targets': [
          { 'os': 'default', 'uri': playwrightTestsUrl },
        ],
      });
    }

    console.log('Sending notification to Microsoft Teams...');
    await axios.post(webhookUrl, message);
    console.log('Notification sent successfully!');
  } catch (error) {
    console.error('Error sending notification to Teams:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

function getStatusColor(passRate, testStats) {
  if (testStats.total === 0) {
    return 'AAAAAA'; // Gray - No data
  }

  if (testStats.failed > 0) {
    if (passRate >= 80) return 'FFBF00'; // Yellow - Failure with high pass rate
    if (passRate >= 50) return 'FF9933'; // Orange - Failure with medium pass rate
    return 'FF0000'; // Red - Critical failure
  }

  if (passRate >= 90) return '00B050'; // Green - Excellent
  if (passRate >= 75) return '92D050'; // Light green - Good
  if (passRate >= 60) return 'FFBF00'; // Yellow - Warning
  return 'FF9933'; // Orange - Concerning (no failures but low rate)
}

function getStatusWithEmoji(testStats) {
  if (testStats.total === 0) {
    return '⚠️ Sem testes';
  }
  if (testStats.failed > 0) {
    return `❌ ${testStats.failed} falha(s)`;
  }
  if (testStats.skipped > 0 && testStats.passed === 0) {
    return '⚠️ Todos pulados';
  }
  return '✅ Todos passaram';
}

function createProgressBar(testStats) {
  const total = testStats.total;
  if (total === 0) return 'Nenhum teste encontrado para exibir barra de progresso';

  const passedPercent = Math.round((testStats.passed / total) * 10);
  const failedPercent = Math.round((testStats.failed / total) * 10);
  const skippedPercent = 10 - passedPercent - failedPercent;

  let progressBar = '▕';
  progressBar += '🟩'.repeat(passedPercent);
  progressBar += '🟥'.repeat(failedPercent);
  progressBar += '⬜'.repeat(skippedPercent);
  progressBar += '▏';

  return progressBar;
}

function createASCIIChart(testStats) {
  const total = testStats.total;
  if (total === 0) return 'Nenhum teste encontrado para exibir gráfico';

  const passedChars = Math.round((testStats.passed / total) * 20);
  const failedChars = Math.round((testStats.failed / total) * 20);
  const skippedChars = Math.round((testStats.skipped / total) * 20);

  const chart = `
\`\`\`
  Resultados dos Testes
  
  Aprovados  | ${'█'.repeat(passedChars)} ${testStats.passed} (${Math.round((testStats.passed / total) * 100)}%)
  Falhas     | ${'█'.repeat(failedChars)} ${testStats.failed} (${Math.round((testStats.failed / total) * 100)}%)
  Pulados    | ${'█'.repeat(skippedChars)} ${testStats.skipped} (${Math.round((testStats.skipped / total) * 100)}%)
\`\`\`
`;

  return chart;
}

function getTestStatsMarkdown(testStats, safePercentFunc) {
  if (testStats.total === 0) {
    return `
**Resumo dos Testes:**
⚠️ **Nenhum teste foi encontrado ou executado**
`;
  }

  return `
**Resumo dos Testes:**
- ✅ **Aprovados:** ${testStats.passed} (${safePercentFunc(testStats.passed, testStats.total)}%)
- ❌ **Falhas:** ${testStats.failed} (${safePercentFunc(testStats.failed, testStats.total)}%)
- ⏩ **Pulados:** ${testStats.skipped} (${safePercentFunc(testStats.skipped, testStats.total)}%)
- 🔢 **Total:** ${testStats.total}
`;
}

sendTeamsNotification();
