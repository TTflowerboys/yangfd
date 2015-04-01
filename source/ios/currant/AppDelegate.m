//
//  AppDelegate.m
//  currant
//
//  Created by Foster Yin on 3/20/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "AppDelegate.h"
#import "CUTEWebViewController.h"
#import "CUTEPropertyListViewController.h"
#import "CUTERentTypeListViewController.h"
#import "CUTEDataManager.h"
#import "CUTEConfiguration.h"
#import <UIImage+Resize.h>
#import "NSURL+CUTE.h"
#import "CUTEUIMacro.h"

@interface AppDelegate () <UITabBarControllerDelegate>

@end

@implementation AppDelegate

//http://stackoverflow.com/questions/7608632/how-do-i-get-the-current-version-of-my-ios-project-in-code
+ (NSString *) appVersion
{
    return [[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"];
}

+ (NSString *) build
{
    return [[NSBundle mainBundle] objectForInfoDictionaryKey: (NSString *)kCFBundleVersionKey];
}

+ (NSString *) versionBuild
{
    NSString * version = [self appVersion];
    NSString * build = [self build];

    NSString * versionBuild = [NSString stringWithFormat: @"v%@", version];

    if (![version isEqualToString: build]) {
        versionBuild = [NSString stringWithFormat: @"%@(%@)", versionBuild, build];
    }

    return versionBuild;
}

- (UINavigationController *)makeViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath {

    CUTEWebViewController *controller = [[CUTEWebViewController alloc] init];
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:[[UIImage imageNamed:CONCAT(icon, @"-active")] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal]];
    controller.url = [NSURL WebURLWithString:urlPath];
    nav.tabBarItem = tabItem;
    controller.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithImage:IMAGE(@"nav-phone") style:UIBarButtonItemStylePlain target:controller action:@selector(onPhoneButtonPressed:)];
    controller.navigationItem.title = STR(@"洋房东");
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    [nav setViewControllers:@[controller]];
    return nav;
}

- (UINavigationController *)makePropertyListViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath {

    CUTEPropertyListViewController *controller = [[CUTEPropertyListViewController alloc] init];
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:[[UIImage imageNamed:CONCAT(icon, @"-active")] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal]];
    controller.url = [NSURL WebURLWithString:urlPath];
    nav.tabBarItem = tabItem;
    controller.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithImage:IMAGE(@"nav-phone") style:UIBarButtonItemStylePlain target:controller action:@selector(onPhoneButtonPressed:)];
    controller.navigationItem.title = STR(@"洋房东");
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    [nav setViewControllers:@[controller]];
    return nav;
}

- (UINavigationController *)makeEditViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath {

    CUTERentTypeListViewController *controller = [[CUTERentTypeListViewController alloc] init];
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:nil];
    nav.tabBarItem = tabItem;
    controller.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithImage:IMAGE(@"nav-phone") style:UIBarButtonItemStylePlain target:controller action:@selector(onPhoneButtonPressed:)];
    controller.navigationItem.title = STR(@"洋房东");
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    [nav setViewControllers:@[controller]];
    return nav;
}


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    NSArray *userAgentComponents =  @[[[NSBundle mainBundle] bundleIdentifier], [AppDelegate versionBuild]];
    NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:[userAgentComponents componentsJoinedByString:@"/"], @"UserAgent", nil];
    [[NSUserDefaults standardUserDefaults] registerDefaults:dictionary];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UITabBarController *rootViewController = [[UITabBarController alloc] init];
    UINavigationController *homeViewController = [self makeViewControllerWithTitle:STR(@"主页") icon:@"tab-home" urlPath:@"/"];
    UINavigationController *editViewController = [self makeEditViewControllerWithTitle:STR(@"发布") icon:@"tab-edit" urlPath:@"/rent_new"];
    [rootViewController setViewControllers:@[
                                             homeViewController,
                                             [self makePropertyListViewControllerWithTitle:STR(@"海外房产") icon:@"tab-property" urlPath:@"/property_list"],
                                             editViewController,
                                             [self makeViewControllerWithTitle:STR(@"出租") icon:@"tab-rent" urlPath:@"/rent_list"],
                                             [self makeViewControllerWithTitle:STR(@"我") icon:@"tab-user" urlPath:@"/user"],
                                             ] animated:YES];
    [self.window setRootViewController:rootViewController];
    rootViewController.delegate = self;
    [rootViewController.tabBar setBackgroundImage:[IMAGE(@"tabbar-background") resizedImage:CGSizeMake([UIScreen mainScreen].bounds.size.width, rootViewController.tabBar.frame.size.height) interpolationQuality:kCGInterpolationHigh]];
    // this will generate a black tab bar
    //http://stackoverflow.com/questions/18734794/how-can-i-change-the-text-and-icon-colors-for-tabbaritems-in-ios-7
    rootViewController.tabBar.barTintColor = CUTE_BAR_COLOR;


    // this will give selected icons and text your apps tint color
    //rootViewController.tabBar.tintColor = HEXCOLOR(0x7a7a7a, 1);  // appTintColor is a UIColor *
    [[UINavigationBar appearance] setBarTintColor:CUTE_BAR_COLOR];
    [[UINavigationBar appearance] setTintColor:CUTE_MAIN_COLOR];
    [[UINavigationBar appearance] setTitleTextAttributes:@{NSForegroundColorAttributeName: [UIColor colorWithRed:255.0/255.0 green:255.0/255.0 blue:255.0/255.0 alpha:1.0]}];
    [[UITabBarItem appearance] setTitleTextAttributes:@{NSFontAttributeName : [UIFont fontWithName:@"HelveticaNeue-Bold" size:10.0f],
                                                        NSForegroundColorAttributeName : HEXCOLOR(0x7a7a7a, 1)} forState:UIControlStateSelected];

    // doing this results in an easier to read unselected state then the default iOS 7 one
    [[UITabBarItem appearance] setTitleTextAttributes:@{NSFontAttributeName : [UIFont fontWithName:@"HelveticaNeue-Bold" size:10.0f],
                                                        NSForegroundColorAttributeName : [UIColor colorWithRed:.5 green:.5 blue:.5 alpha:1]
                                                        } forState:UIControlStateNormal];
    [self.window makeKeyAndVisible];
    CUTEWebViewController *firstWebviewController = (CUTEWebViewController *)([(UINavigationController *)[rootViewController.viewControllers firstObject] topViewController]);
    [firstWebviewController loadURL:firstWebviewController.url];
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    [[CUTEDataManager sharedInstance] saveAllCookies];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    [[CUTEDataManager sharedInstance] restoreAllCookies];
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

- (NSArray *)needLoginURLList {
    return @[@"/user"];
}

#pragma UITabbarViewControllerDelegate

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UINavigationController *)viewController {
    if ([viewController.topViewController isKindOfClass:[CUTEWebViewController class]]) {
        CUTEWebViewController *webViewController = (CUTEWebViewController *)viewController.topViewController;
        if ([[self needLoginURLList] containsObject:webViewController.url.path] && ![[CUTEDataManager sharedInstance] isUserLoggedIn]) {
            NSURL *originalURL = webViewController.url;
            [webViewController loadURL:[NSURL WebURLWithString:CONCAT(@"/signin?from=", [originalURL.absoluteString stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding])]];
        }
        else {
            [webViewController loadURL:webViewController.url];
        }
    }
    else {
        
    }
}

@end
