//
//  CUTEMoblieClient.h
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <JavaScriptCore/JSExport.h>

@protocol CUTEJSExport <JSExport>

- (void)log:(JSValue *)message;

- (void)signIn:(JSValue *)result;

- (void)logOut;

- (void)editRentTicket:(JSValue *)result;

@end


@interface CUTEMoblieClient : NSObject <CUTEJSExport>

@property (nonatomic, weak) UIViewController *controller;


@end
