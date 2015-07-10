//
//  KIFTestActor+OHHttpStubs.m
//  BluePlate
//
//  Created by Foster Yin on 3/19/14.
//  Copyright (c) 2014 Brothers Bridge Technology. All rights reserved.
//

#import "KIFTestActor+OHHttpStubs.h"
#import <OHHTTPStubs.h>
#import "CUTEConfiguration.h"

@implementation KIFTestActor (OHHttpStubs)

- (void)setStubEnabled:(BOOL)enable
{
    [OHHTTPStubs setEnabled:enable];
}

- (void)registerRequestURLPath:(NSString *)urlPath toResponseFileAtPath:(NSString *)filePath
{
    [OHHTTPStubs stubRequestsPassingTest:^BOOL(NSURLRequest *request) {
        NSString *urlString = [[NSURL URLWithString:urlPath relativeToURL:[CUTEConfiguration hostURL]] absoluteString];
        return [request.URL.absoluteString isEqualToString:urlString];
    } withStubResponse:^OHHTTPStubsResponse*(NSURLRequest *request) {
//        NSString *path = [[NSBundle bundleForClass:[self class]] pathForResource:[filePath stringByDeletingPathExtension] ofType:[filePath pathExtension]];
        return [OHHTTPStubsResponse responseWithFileAtPath:OHPathForFile(filePath, [self class])
                                                statusCode:200 headers:@{@"Content-Type":@"application/json"}];
    }].name = urlPath;
}

- (void)unregisterRequestURLPath:(NSString *)urlPath
{
    NSArray *stubs = [OHHTTPStubs allStubs];
    for (id<OHHTTPStubsDescriptor> stub in stubs) {
        if ([[stub name] isEqualToString:urlPath])
        {
            [OHHTTPStubs removeStub:stub];
        }
    }
}

- (void)waitForOperationFinished:(NSOperation *)operation
{
    [self runBlock:^KIFTestStepResult(NSError *__autoreleasing *error) {
        while(!operation.isFinished)
            ;
        return KIFTestStepResultSuccess;
    }];
}

@end
