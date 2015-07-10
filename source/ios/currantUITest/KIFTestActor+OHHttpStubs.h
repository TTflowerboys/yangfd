//
//  KIFTestActor+OHHttpStubs.h
//  BluePlate
//
//  Created by Foster Yin on 3/19/14.
//  Copyright (c) 2014 Brothers Bridge Technology. All rights reserved.
//

#import "KIFTestActor.h"

@interface KIFTestActor (OHHttpStubs)

- (void)setStubEnabled:(BOOL)enable;

- (void)registerRequestURLPath:(NSString *)urlPath toResponseFileAtPath:(NSString *)filePath;

- (void)unregisterRequestURLPath:(NSString *)urlPath;

- (void)waitForOperationFinished:(NSOperation *)operation;

@end
