using AiSecStudio.Analysis.Abstractions;
using AiSecStudio.Plugins.Abstractions;
using AiSecStudio.Plugins.Abstractions.Logging;

namespace SamplePlugin.HelloWorld;

/// <summary>
/// A minimal reference plugin. It records each lifecycle hook through the host-provided
/// <see cref="IPluginLogger"/> so integration tests can observe that an isolated plugin was loaded,
/// started, stopped, and unloaded correctly; and, when the host offers an
/// <see cref="IAnalyzerContributionRegistry"/>, it demonstrates the extension point by contributing a
/// <see cref="ICSharpSourceAnalyzer"/> while it is <em>enabled</em> — registering on start and
/// un-registering on stop — so its analyzer runs only while the plugin is active.
/// </summary>
public sealed class HelloWorldPlugin : IPlugin
{
    private readonly HelloWorldAnalyzer _analyzer = new();
    private IPluginLogger? _logger;
    private IAnalyzerContributionRegistry? _analyzers;

    /// <inheritdoc />
    public Task OnLoadAsync(IPluginContext context, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(context);

        _logger = context.Services.GetService(typeof(IPluginLogger)) as IPluginLogger;
        _analyzers = context.Services.GetService(typeof(IAnalyzerContributionRegistry)) as IAnalyzerContributionRegistry;

        Log($"loaded {context.Manifest.Id} v{context.Manifest.Version}");
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task OnStartAsync(CancellationToken cancellationToken)
    {
        // Contribute the analyzer only while enabled, so a disabled plugin's analyzer stops running.
        _analyzers?.Add(_analyzer);
        Log("started");
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task OnStopAsync(CancellationToken cancellationToken)
    {
        _analyzers?.Remove(_analyzer);
        Log("stopped");
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task OnUnloadAsync(CancellationToken cancellationToken)
    {
        Log("unloaded");
        return Task.CompletedTask;
    }

    private void Log(string message) => _logger?.Log(PluginLogLevel.Information, message);
}
