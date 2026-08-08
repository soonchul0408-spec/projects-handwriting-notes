import Cocoa

final class CompletionBadgeDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.mainMenu = makeMenu()
        NSApp.dockTile.badgeLabel = "1"
    }

    @objc private func clearBadge() {
        NSApp.dockTile.badgeLabel = nil
    }

    @objc private func quitApp() {
        NSApp.terminate(nil)
    }

    private func makeMenu() -> NSMenu {
        let menuBar = NSMenu()
        let appMenuItem = NSMenuItem()
        let appMenu = NSMenu()

        let clearItem = NSMenuItem(title: "배지 지우기", action: #selector(clearBadge), keyEquivalent: "")
        clearItem.target = self
        appMenu.addItem(clearItem)
        appMenu.addItem(.separator())

        let quitItem = NSMenuItem(title: "작업 완료 알림 종료", action: #selector(quitApp), keyEquivalent: "q")
        quitItem.target = self
        appMenu.addItem(quitItem)

        appMenuItem.submenu = appMenu
        menuBar.addItem(appMenuItem)
        return menuBar
    }
}

let application = NSApplication.shared
let delegate = CompletionBadgeDelegate()
application.delegate = delegate
application.run()
