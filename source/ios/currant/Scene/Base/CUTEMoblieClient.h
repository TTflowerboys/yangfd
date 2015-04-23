//
//  CUTEMoblieClient.h
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <JavaScriptCore/JSExport.h>

@protocol CUTEJSExport <JSExport>

- (void)log:(JSValue *)message;

- (void)signIn:(JSValue *)result;

- (void)logOut;

@end


@interface CUTEMoblieClient : NSObject <CUTEJSExport>

@end
