//
//  AppDelegate.m
//  currant
//
//  Created by Foster Yin on 3/20/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "AppDelegate.h"
#import "CUTEWebViewController.h"

@interface AppDelegate () <UITabBarControllerDelegate>

@end

@implementation AppDelegate


- (UIViewController *)makeViewControllerWithTitle:(NSString *)title icon:(UIImage *)icon urlPath:(NSString *)urlPath {
    CUTEWebViewController *controller = [[CUTEWebViewController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:icon selectedImage:icon];
    controller.tabBarItem = tabItem;
    controller.urlPath = urlPath;
    return controller;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UITabBarController *rootViewController = [[UITabBarController alloc] init];
    [rootViewController setViewControllers:@[
                                             [self makeViewControllerWithTitle:STR(@"Home") icon:nil urlPath:@"/"],
                                             [self makeViewControllerWithTitle:STR(@"Property List") icon:nil urlPath:@"/property_list"],
                                             [self makeViewControllerWithTitle:STR(@"Edit") icon:nil urlPath:nil],
                                             [self makeViewControllerWithTitle:STR(@"Rent") icon: nil urlPath:@"/rent_list"],
                                             [self makeViewControllerWithTitle:STR(@"Me") icon:nil urlPath:@"/user"],
                                             ] animated:YES];
    [self.window setRootViewController:rootViewController];
    rootViewController.delegate = self;
    [self.window makeKeyAndVisible];
    CUTEWebViewController *firstWebviewController = (CUTEWebViewController *)[rootViewController.viewControllers firstObject];
    [firstWebviewController loadURLPath:firstWebviewController.urlPath];
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
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
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

#pragma UITabbarViewControllerDelegate

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UIViewController *)viewController {
    if ([viewController isKindOfClass:[CUTEWebViewController class]]) {
        [(CUTEWebViewController *)viewController loadURLPath:[(CUTEWebViewController *)viewController urlPath]];
    }
}

@end
